// could also import this.... or....
const IPFS = window.Ipfs

class FS {
  constructor() {
    this.promises = this
  }

  async initIPFS() {
    this._ipfs = IPFS.create()
  }

  async readFile(path, options) {
    const ipfs = await this._ipfs
    // https://nodejs.org/api/fs.html#fs_fspromises_readfile_path_options
    console.log("readFile", path, options)
  }

  async writeFile(file, data, options) {
    const ipfs = await this._ipfs
    // https://nodejs.org/api/fs.html#fs_fspromises_writefile_file_data_options
    console.log("writeFile", file, data, options)
  }

  async unlink(path) {
    const ipfs = await this._ipfs
    // https://nodejs.org/api/fs.html#fs_fspromises_unlink_path
    console.log("unlink", path)
  }

  async readdir(path, options) {
    const ipfs = await this._ipfs
    // https://nodejs.org/api/fs.html#fs_fspromises_readdir_path_options
    console.log("readdir", path, options)
  }

  async mkdir(path, mode) {
    const ipfs = await this._ipfs
    // https://nodejs.org/api/fs.html#fs_fspromises_mkdir_path_options
    console.log("mkdir", path, mode)
  }

  async rmdir(path) {
    const ipfs = await this._ipfs
    // https://nodejs.org/api/fs.html#fs_fspromises_rmdir_path
    console.log("rmdir", path)
  }

  async stat(path, options) {
    const ipfs = await this._ipfs
    // https://nodejs.org/api/fs.html#fs_fspromises_stat_path_options
    console.log("stat", path, options)
  }

  async lstat(path, options) {
    const ipfs = await this._ipfs
    // https://nodejs.org/api/fs.html#fs_fspromises_lstat_path_options
    console.log("lstat", path, options)
  }

  async readlink(path, options) {
    const ipfs = await this._ipfs
    // https://nodejs.org/api/fs.html#fs_fspromises_readlink_path_options) (optional ¹(#footnote-1)
    console.log("readlink", path, options)
  }

  async symlink(target, path, type) {
    const ipfs = await this._ipfs
    // https://nodejs.org/api/fs.html#fs_fspromises_symlink_target_path_type) (optional ¹(#footnote-1)
    console.log("symlink", target, path, type)
  }

  async chmod(path, mode) {
    const ipfs = await this._ipfs
    // https://nodejs.org/api/fs.html#fs_fspromises_chmod_path_mode) (optional ²(#footnote-2)
    console.log("chmod", path, mode)
  }
}

module.exports = FS
