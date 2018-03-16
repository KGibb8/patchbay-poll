const { h, Value } = require('mutant')
const ScuttlePoll = require('scuttle-poll')
const { parsePoll } = require('ssb-poll-schema')

const pull = require('pull-stream')
const Scroller = require('mutant-scroll')
const next = require('pull-next-step')

const PollCard = require('./pollCard')

module.exports = function pollIndex ({ server, createPollStream, mdRenderer, openNewPage }) {
  if (!mdRenderer) mdRenderer = (text) => text
  // TODO wire up mdRenderer (inject or require?)
  // TODO extract createPollStream into ScuttlePoll

  var viewMode = Value('future')
  var page = Value(createPage('future'))

  // this doesn't work
  viewMode(mode => {
    console.log(mode)
    page.set(createPage(mode))
  })

  return page

  function createPage (mode) {
    const base = {
      classList: ['-pollIndex'],
      prepend: h('header', [
        h('h1', ['Polls', mode]),
        h('button', { 'ev-click': openNewPage }, 'New Poll'),
        h('div.show', [
          'Show: ',
          h('button', { 'ev-click': () => viewMode.set('future') }, 'Open'),
          h('button', { 'ev-click': () => viewMode.set('past') }, 'Closed')
        ])
      ])
    }

    switch (mode) {
      case 'future':
        return Scroller(Object.assign({}, base, {
          streamToTop: next(createPollStream, { old: false, limit: 100, property: ['value', 'timestamp'] }),
          streamToBottom: next(createPollStream, { reverse: true, limit: 100, live: false, property: ['value', 'timestamp'] }),
          render: (msg) => {
            const { closesAt } = parsePoll(msg)

            if (new Date(closesAt) < new Date()) return// TODO figure out nice way to make this update
            return PollCard({ msg, server, mdRenderer })
          }
        }))

      // TODO get logic right - I just flipped the streamToTop/Bottom && render filter
      case 'past':
        return Scroller(Object.assign({}, {
          streamToTop: next(createPollStream, { reverse: true, limit: 100, live: false, property: ['value', 'timestamp'] }),
          streamToBottom: next(createPollStream, { old: false, limit: 100, property: ['value', 'timestamp'] }),
          render: (msg) => {
            const { closesAt } = parsePoll(msg)

            if (new Date(closesAt) > new Date()) return// TODO figure out nice way to make this update
            return PollCard({ msg, server, mdRenderer })
          }
        }))
    }
  }
}
