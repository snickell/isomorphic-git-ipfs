// We're gonna use the IPFS MFS API:
// https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#the-mutable-files-api

class NotImplemented extends Error {}
class SymlinksNotSupportedError extends Error {}

async function toArray(asyncIterable) {
  const out = []
  for await (const x of asyncIterable) {
    out.push(x)
  }
  return out
}

class Stat {
  constructor({ type, mode, size, ino, mtimeMs, ctimeMs }) {
    Object.assign(this, { type, mode, size, ino, mtimeMs })
    this.ctimeMs = ctimeMs || mtimeMs
    this.uid = this.gid = this.dev = 1
  }
  isFile() {
    return this.type === "file"
  }
  isDirectory() {
    return this.type === "dir"
  }
  isSymbolicLink() {
    return this.type === "symlink"
  }
}


function getIPFS() {
  if (typeof window !== 'undefined') {
    return window.Ipfs
  } else if (typeof require !== 'undefined') {
    return require('ipfs')
  } else {
    //return await import('ipfs')
    throw Error("Can't find Ipfs")
  }
}

const IPFS = getIPFS()
const _ipfs = IPFS.create()

/*
  This class implemented to fulfill:
  https://isomorphic-git.org/docs/en/fs#using-the-promise-api-preferred :

  Using the "promise" API (preferred)
  A "promise" fs object must implement the same set functions as a "callback" implementation, but it implements the promisified versions, and they should all be on a property called promises:

  fs.promises.readFile(path[, options])
  fs.promises.writeFile(file, data[, options])
  fs.promises.unlink(path)
  fs.promises.readdir(path[, options])
  fs.promises.mkdir(path[, mode])
  fs.promises.rmdir(path)
  fs.promises.stat(path[, options])
  fs.promises.lstat(path[, options])
  fs.promises.readlink(path[, options]) (optional ¹)
  fs.promises.symlink(target, path[, type]) (optional ¹)
  fs.promises.chmod(path, mode) (optional ²)

  Footnote ¹ readlink and symlink are only needed to work with git repos that contain symlinks.

  Footnote ² Right now, isomorphic-git rewrites the file if it needs to change its mode. In the future, if chmod is available it will use that.

*/
class FS {
  constructor() {
    this.promises = this
    this.flush = {
      // flush	boolean	true	If true the changes will be immediately flushed to disk
      flush: true
    }
    this._ipfs = _ipfs
  }

  get defaultIpfsOptions() {
    return { 
      ...this.flush,
    }
  }

  async chmod(path, mode) {
    const ipfs = await this._ipfs

    /*
      https://nodejs.org/api/fs.html#fs_fspromises_chmod_path_mode
      (optional ²(#footnote-2) :

      Footnote ² Right now, isomorphic-git rewrites the file if it needs to change its mode. In the future, if chmod is available it will use that.

      fsPromises.chmod(path, mode)#
        path <string> | <Buffer> | <URL>
        mode <string> | <integer>
        Returns: <Promise>
        Changes the permissions of a file then resolves the Promise with no arguments upon succces.

    */
    console.log("chmod", path, mode)

    // https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#ipfsfileschmodpath-mode-options
    return await ipfs.files.chmod(path, mode, this.defaultIpfsOptions)
  }

  async lstat(path, { bigint=false }={}) {
    const ipfs = await this._ipfs
    console.log("lstat", path)

    /*
      https://nodejs.org/api/fs.html#fs_fspromises_lstat_path_options :

      fsPromises.lstat(path[, options])#
        path <string> | <Buffer> | <URL>
        options <Object>

        bigint <boolean> Whether the numeric values in the returned fs.Stats object should be bigint. Default: false.
        Returns: <Promise>
        Asynchronous lstat(2). The Promise is resolved with the fs.Stats object for the given symbolic link path.
    */

    throw new SymlinksNotSupportedError()

    // MFS doesn't seem to have symlink support?
    // probably creates cyclic problems?
    return this.stat(path)
  }

  async mkdir(path, { recursive=false, mode=0o777 }={}) {
    const ipfs = await this._ipfs

    /*
      https://nodejs.org/api/fs.html#fs_fspromises_mkdir_path_options :

      fsPromises.mkdir(path[, options])#
        Added in: v10.0.0
        path <string> | <Buffer> | <URL>
        options <Object> | <integer>

        recursive <boolean> Default: false
        mode <string> | <integer> Not supported on Windows. Default: 0o777.
        Returns: <Promise>
        Asynchronously creates a directory then resolves the Promise with either no arguments, or the first directory path created if recursive is true.

        The optional options argument can be an integer specifying mode (permission and sticky bits), or an object with a mode property and a recursive property indicating whether parent directories should be created. Calling fsPromises.mkdir() when path is a directory that exists results in a rejection only when recursive is false.
    */
    console.log("mkdir", path, mode)

    // https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#ipfsfilesmkdirpath-options
    return await ipfs.files.mkdir(path, { mode, ...this.defaultIpfsOptions })
  }

  async readdir(path, { encoding='utf8', withFileTypes=false }={}) {
    const ipfs = await this._ipfs

    /*
      https://nodejs.org/api/fs.html#fs_fspromises_readdir_path_options

      fsPromises.readdir(path[, options])#
        path <string> | <Buffer> | <URL>
        options <string> | <Object>

        encoding <string> Default: 'utf8'
        withFileTypes <boolean> Default: false
        Returns: <Promise>
        Reads the contents of a directory then resolves the Promise with an array of the names of the files in the directory excluding '.' and '..'.

        The optional options argument can be a string specifying an encoding, or an object with an encoding property specifying the character encoding to use for the filenames. If the encoding is set to 'buffer', the filenames returned will be passed as Buffer objects.

        If options.withFileTypes is set to true, the resolved array will contain fs.Dirent objects.

        const fs = require('fs');

        async function print(path) {
          const files = await fs.promises.readdir(path);
          for (const file of files) {
            console.log(file);
          }
        }
        print('./').catch(console.error);
    */

    console.log("readdir", path)

    // https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#ipfsfileslspath-options
    const dirents = await toArray(
        ipfs.files.ls(path)
    )
    
    // Unless withFileTypes is passed in, we just return the filename
    return dirents.map(
      ({ name, type, size, cid, mode, mtime }) => name
    )
  }

  async readFile(path, { encoding=null, flag='r' }={}) {
    const ipfs = await this._ipfs

    /*
      https://nodejs.org/api/fs.html#fs_fspromises_readfile_path_options :

      fsPromises.readFile(path[, options])#
        path <string> | <Buffer> | <URL> | <FileHandle> filename or FileHandle
        options <Object> | <string>

        encoding <string> | <null> Default: null
        flag <string> See support of file system flags. Default: 'r'.
        Returns: <Promise>
        Asynchronously reads the entire contents of a file.

        The Promise is resolved with the contents of the file. If no encoding is specified (using options.encoding), the data is returned as a Buffer object. Otherwise, the data will be a string.

        If options is a string, then it specifies the encoding.

        When the path is a directory, the behavior of fsPromises.readFile() is platform-specific. On macOS, Linux, and Windows, the promise will be rejected with an error. On FreeBSD, a representation of the directory's contents will be returned.

        Any specified FileHandle has to support reading.
    */
    console.log("readFile", path)

    const chunks = []
    for await (const chunk of ipfs.files.read(path)) {
      chunks.push(chunk)
    }

    return uint8ArrayConcat(chunks).toString()
  }  

  async readlink(path, { encoding='utf8' }={}) {
    const ipfs = await this._ipfs

    /*
      https://nodejs.org/api/fs.html#fs_fspromises_readlink_path_options :
      (optional ¹(#footnote-1)

      Footnote ¹ readlink and symlink are only needed to work with git repos that contain symlinks.

      fsPromises.readlink(path[, options])#
        path <string> | <Buffer> | <URL>
        options <string> | <Object>

        encoding <string> Default: 'utf8'
        Returns: <Promise>
        Asynchronous readlink(2). The Promise is resolved with the linkString upon success.

        The optional options argument can be a string specifying an encoding, or an object with an encoding property specifying the character encoding to use for the link path returned. If the encoding is set to 'buffer', the link path returned will be passed as a Buffer object.
    */
    console.log("readlink", path)
    throw new SymlinksNotSupportedError()
  }

  async rmdir(path, { maxRetries=0, recursive=false, retryDelay=100 }={}) {
    const ipfs = await this._ipfs

    /*
      https://nodejs.org/api/fs.html#fs_fspromises_rmdir_path :

      fsPromises.rmdir(path[, options])#
        path <string> | <Buffer> | <URL>
        options <Object>

        maxRetries <integer> If an EBUSY, EMFILE, ENFILE, ENOTEMPTY, or EPERM error is encountered, Node.js will retry the operation with a linear backoff wait of retryDelay ms longer on each try. This option represents the number of retries. This option is ignored if the recursive option is not true. Default: 0.
        recursive <boolean> If true, perform a recursive directory removal. In recursive mode, errors are not reported if path does not exist, and operations are retried on failure. Default: false.
        retryDelay <integer> The amount of time in milliseconds to wait between retries. This option is ignored if the recursive option is not true. Default: 100.
        Returns: <Promise>
        Removes the directory identified by path then resolves the Promise with no arguments upon success.

        Using fsPromises.rmdir() on a file (not a directory) results in the Promise being rejected with an ENOENT error on Windows and an ENOTDIR error on POSIX.
    */
    console.log("rmdir", path)

    // TODO: probably should check if its a dir first and throw an error if its not 🤷‍♂️

    return await ipfs.files.rm(path, { recursive, ...this.defaultIpfsOptions })
  }

  async stat(path, { bigint=false }={}) {
    const ipfs = await this._ipfs

    /*
      https://nodejs.org/api/fs.html#fs_fspromises_stat_path_options :

      fsPromises.stat(path[, options])#
        path <string> | <Buffer> | <URL>
        options <Object>

        bigint <boolean> Whether the numeric values in the returned fs.Stats object should be bigint. Default: false.
        Returns: <Promise>
        The Promise is resolved with the fs.Stats object for the given path.

        Link to fs.Stats: https://nodejs.org/api/fs.html#fs_class_fs_stats
    */
    console.log("stat", path)

    // https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#ipfsfilesstatpath-options

    // TODO: compare difference between fs.Stats (https://nodejs.org/api/fs.html#fs_class_fs_stats)
    // and the IPFS return value:
    /*
      the returned object has the following keys:
        cid a CID instance
        size is an integer with the file size in Bytes
        cumulativeSize is an integer with the size of the DAGNodes making up the file in Bytes
        type is a string that can be either directory or file
        blocks if type is directory, this is the number of files in the directory. If it is file it is the number of blocks that make up the file
        withLocality is a boolean to indicate if locality information is present
        local is a boolean to indicate if the queried dag is fully present locally
        sizeLocal is an integer indicating the cumulative size of the data present locally
    */
    const {
      cid, size, cumulativeSize, type, blocks, 
      withLocality, local, sizeLocal 
    } = await ipfs.files.stat(path)

    const STAT_FIXED_RESULTS = {
      // TODO: we don't have mode....
      // we could get from ipfs.files.ls(parent(path))
      mode:  0o666,
      // TODO: does inode need to be a number? is it necessary?
      inode: cid,
      // TODO: we don't have mtime... 
      // we could get from ipfs.files.ls(parent(path))
      mtimeMs: 0,
    }

    // TODO: get the missing values from ipfs.files.ls:
    // https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#ipfsfileslspath-options
    /*
      ipfs.files.ls(path)
        Returns
        Type	Description
        AsyncIterable<Object>	An async iterable that yields objects representing the files
        Each object contains the following keys:

        name which is the file's name
        type which is the object's type (directory or file)
        size the size of the file in bytes
        cid the hash of the file (A CID instance)
        mode the UnixFS mode as a Number
        mtime an objects with numeric secs and nsecs properties
    */
    return new Stat({ type, size, ...STAT_FIXED_RESULTS })
  }

  async symlink(target, path, type='file') {
    const ipfs = await this._ipfs

    /*
      https://nodejs.org/api/fs.html#fs_fspromises_symlink_target_path_type
      (optional ¹(#footnote-1)
      Footnote ¹ readlink and symlink are only needed to work with git repos that contain symlinks.

      fsPromises.symlink(target, path[, type])#
        target <string> | <Buffer> | <URL>
        path <string> | <Buffer> | <URL>
        type <string> Default: 'file'
        Returns: <Promise>
        Creates a symbolic link then resolves the Promise with no arguments upon success.

        The type argument is only used on Windows platforms and can be one of 'dir', 'file', or 'junction'. Windows junction points require the destination path to be absolute. When using 'junction', the target argument will automatically be normalized to absolute path.
    */
    console.log("symlink", target, path, type)
    throw new SymlinksNotSupportedError()
  }

  async unlink(path) {
    const ipfs = await this._ipfs

    /*
      https://nodejs.org/api/fs.html#fs_fspromises_unlink_path :

      fsPromises.unlink(path)#
        path <string> | <Buffer> | <URL>
        Asynchronous unlink(2). The Promise is resolved with no arguments upon success.
    */
    console.log("unlink", path)
    return ipfs.files.rm(path, this.defaultIpfsOptions)
  }

  async writeFile(file, data, { encoding='utf8', mode=0o666, flag='w' }={}) {
    const ipfs = await this._ipfs

    /*
      https://nodejs.org/api/fs.html#fs_fspromises_writefile_file_data_options :

      fsPromises.writeFile(file, data[, options])#
        file <string> | <Buffer> | <URL> | <FileHandle> filename or FileHandle
        data <string> | <Buffer> | <Uint8Array>
        options <Object> | <string>

        encoding <string> | <null> Default: 'utf8'
        mode <integer> Default: 0o666
        flag <string> See support of file system flags. Default: 'w'.
        Returns: <Promise>
        Asynchronously writes data to a file, replacing the file if it already exists. data can be a string or a buffer. The Promise will be resolved with no arguments upon success.

        The encoding option is ignored if data is a buffer.

        If options is a string, then it specifies the encoding.

        Any specified FileHandle has to support writing.

        It is unsafe to use fsPromises.writeFile() multiple times on the same file without waiting for the Promise to be resolved (or rejected).
    */
    console.log("writeFile", file, data, { encoding, mode, flag })
    
    // https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#ipfsfileswritepath-content-options
    // ipfs.files.write(path, content, [options])
    // content	String, Buffer, AsyncIterable<Buffer> or Blob	The content to write to the path

    // In can be string, Buffer, or Uint8Array
    // gotta convert a Uint8Array to Blob or Buffer?
    if (data instanceof Uint8Array)
      data = new Blob([data])
    return await ipfs.files.write(path, data, this.defaultIpfsOptions)
  }

}

if (typeof window !== 'undefined') {
  window.FS = FS
} else if (typeof module !== 'undefined') {
  module.exports = FS
}
