#pragma once

#include "fileexchange.hpp"
#include "types.hpp"


class tAquaWeb {
public:
    tAquaWeb();
    ~tAquaWeb();

    void run();

private:
    ConfigManager configM;
};

