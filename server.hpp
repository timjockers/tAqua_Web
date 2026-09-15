#pragma once

#include <string>
#include "httplib.h"
#include "fileexchange.hpp"

class HTTPServer {
public:
    HTTPServer(ConfigManager* configManager);
    void start(const std::string& host, int port);

private:
    httplib::Server svr;
    ConfigManager* configM;
    void setupWebpage();
    void setupRoutes();
};
