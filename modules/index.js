const modules = {
  app: {
    page: {
      pollIndex: require('./app/page/pollIndex')
    }
  },
  // message: {
  //   html: {
  //     render: {
  //       poll: require('./message/html/render/poll')

  //     }
  //   }
  // },
  router: {
    sync: {
      routes: require('./router/sync/routes')
    }
  },
  styles: {
    css: require('./styles/css'),
    mcss: require('./styles/mcss')
  }
}

module.exports = { 'patchbay-poll': modules }