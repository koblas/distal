#!/usr/bin/env python

import tornado.ioloop
import tornado.web
import tornado.httpserver
import tornado.options
import logging
import os

tornado.options.define('port', type=int, default=9000, help='server port number (default: 9000)')
tornado.options.define('debug', type=bool, default=False, help='run in debug mode with autoreload (default: False)')

class TodoHandler(tornado.web.RequestHandler):
    def get(self, id=None):
        self.finish('1')

    def post(self, id=None):
        self.finish('1')

    def delete(self, id=None):
        self.finish('1')

class App(tornado.web.Application):
    def __init__(self, *args, **kwargs):
        settings = {
            "static_path" : os.path.join(os.path.dirname(__file__), "public"),
            "static_url_prefix" : '/public/',
            "debug" : kwargs.get('debug', False),
        }

        routes = [
            (r"/todo/?([^/]*)", TodoHandler),
            (r"/([^/]*)", tornado.web.StaticFileHandler, {
                    'path' : settings['static_path'], 
                    'default_filename' : 'index.html'
                }),
        ]

        super(App, self).__init__(routes, **settings)

if __name__ == "__main__":
    tornado.options.parse_command_line()
    
    options = tornado.options.options
    server = tornado.httpserver.HTTPServer(App(debug=options.debug))

    server.listen(options.port)
    logging.info('started on port: %d', options.port);

    tornado.ioloop.IOLoop.instance().start()
