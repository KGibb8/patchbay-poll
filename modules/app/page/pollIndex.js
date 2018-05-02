const { h } = require('mutant')
const nest = require('depnest')
const ScuttlePoll = require('scuttle-poll')
const { isPoll } = require('ssb-poll-schema')
const pull = require('pull-stream')
const page = require('../../../views/index')

exports.gives = nest({
  'app.html.menuItem': true,
  'app.page.pollIndex': true
})

exports.needs = nest({
  'feed.pull.type': 'first',
  'sbot.obs.connection': 'first'
})

exports.create = function (api) {
  return nest({
    'app.html.menuItem': menuItem,
    'app.page.pollIndex': pollIndex
  })

  function menuItem (handleClick) {
    return h('a', {
      style: { order: 9 },
      'ev-click': () => handleClick({ page: 'polls' })
    }, '/polls')
  }

  function pollIndex (path) {
    return page({
      scuttlePoll: ScuttlePoll(api.sbot.obs.connection),
      createPollStream: (opts) => pull(
        api.feed.pull.type('poll')(opts), // TODO update patchcore
        pull.through(console.log),
        pull.filter(isPoll)
      )
    })
  }
}