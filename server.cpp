#include "server.hpp"

#include <fstream>
#include <sstream>

using namespace std;

static string read_html_file(const string& path) {
    ifstream file(path);
    if (!file.is_open()) {
        return "";
    }
    stringstream buffer;
    buffer << file.rdbuf();
    return buffer.str();
}
