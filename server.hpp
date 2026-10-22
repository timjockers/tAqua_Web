#pragma once

#include <string>
#include "httplib.h"
#include "fileexchange.hpp"

class HTTPServer {
public:
    HTTPServer(ConfigManager* configManager, StatusManager* statusManager);
    ~HTTPServer();
    void start(const std::string& host, int port);
    void stop() noexcept;

private:
    httplib::Server svr;
    ConfigManager* configM;
    StatusManager* statusM;

    void setupWebpage();
    void setupRoutes();
};
