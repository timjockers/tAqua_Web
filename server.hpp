#pragma once

#include <string>
#include "httplib.h"
#include "fileexchange.hpp"

class HTTPServer {
public:
    HTTPServer(ConfigManager* configManager);
    ~HTTPServer();
    void start(const std::string& host, int port);
    void stop() noexcept;

private:
    httplib::Server svr;
    ConfigManager* configM;
    void setupWebpage();
    void setupRoutes();
};
