class FS {
  constructor() {
    this.promises = this
  }

  readFile(path, options) {
    // https://nodejs.org/api/fs.html#fs_fspromises_readfile_path_options
    console.log("readFile", path, options)
  }

  writeFile(file, data, options) {
    // https://nodejs.org/api/fs.html#fs_fspromises_writefile_file_data_options
    console.log("writeFile", file, data, options)
  }

  unlink(path) {
    // https://nodejs.org/api/fs.html#fs_fspromises_unlink_path
    console.log("unlink", path)
  }

  readdir(path, options) {
    // https://nodejs.org/api/fs.html#fs_fspromises_readdir_path_options
    console.log("readdir", path, options)
  }

  mkdir(path, mode) {
    // https://nodejs.org/api/fs.html#fs_fspromises_mkdir_path_options
    console.log("mkdir", path, mode)
  }

  rmdir(path) {
    // https://nodejs.org/api/fs.html#fs_fspromises_rmdir_path
    console.log("rmdir", path)
  }

  stat(path, options) {
    // https://nodejs.org/api/fs.html#fs_fspromises_stat_path_options
    console.log("stat", path, options)
  }

  lstat(path, options) {
    // https://nodejs.org/api/fs.html#fs_fspromises_lstat_path_options
    console.log("lstat", path, options)
  }

  readlink(path, options) {
    // https://nodejs.org/api/fs.html#fs_fspromises_readlink_path_options) (optional ¹(#footnote-1)
    console.log("readlink", path, options)
  }

  symlink(target, path, type) {
    // https://nodejs.org/api/fs.html#fs_fspromises_symlink_target_path_type) (optional ¹(#footnote-1)
    console.log("symlink", target, path, type)
  }

  chmod(path, mode) {
    // https://nodejs.org/api/fs.html#fs_fspromises_chmod_path_mode) (optional ²(#footnote-2)
    console.log("chmod", path, mode)
  }
}

module.exports = FS
