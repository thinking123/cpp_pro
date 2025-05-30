tar -xf llvm-project-11.1.0.src.tar.xz
cd llvm-project-11.1.0.src
mkdir build && cd build
cmake -G "Unix Makefiles" ../llvm \
  -DLLVM_ENABLE_PROJECTS="clang;clang-tools-extra" \
  -DCMAKE_BUILD_TYPE=Release \
  -DCMAKE_INSTALL_PREFIX=/usr/local/llvm-11.1.0
make -j$(sysctl -n hw.ncpu)
make install
