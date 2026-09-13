cmake_minimum_required(VERSION 3.10)
project(_WEB CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(PkgConfig REQUIRED)

pkg_check_modules(LIBCONFIGPP REQUIRED libconfig++)

add_executable(_web
    main.cpp
    fileexchange.cpp
    web.cpp
)

target_link_libraries(_web PRIVATE ${LIBCONFIGPP_LIBRARIES})
target_include_directories(_web PRIVATE ${LIBCONFIGPP_INCLUDE_DIRS})
