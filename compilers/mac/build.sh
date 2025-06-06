#!/bin/bash

INSTALL_DIR="/usr/local/llvm-20.1.6"

# 判断是否已经安装过
if [ -d "$INSTALL_DIR" ]; then
  echo "LLVM $INSTALL_DIR 已经存在，跳过安装。"
  exit 0
fi

# 解压源码
tar -xf llvm-20.1.6.src.tar.xz

cd llvm-20.1.6.src || exit 1

mkdir -p build && cd build

cmake -G "Unix Makefiles" ../llvm \
  -DLLVM_ENABLE_PROJECTS="clang;clang-tools-extra" \
  -DCMAKE_BUILD_TYPE=Release \
  -DCMAKE_INSTALL_PREFIX="$INSTALL_DIR"

make -j$(sysctl -n hw.ncpu)

make install
