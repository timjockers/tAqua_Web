#pragma once

#include "fileexchange.hpp"


class tAquaWeb {
public:
    tAquaWeb();
    ~tAquaWeb();

    void run();

private:
    ConfigManager configM;
};

