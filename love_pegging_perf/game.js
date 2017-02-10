
var Module;

if (typeof Module === 'undefined') Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

if (!Module.expectedDataFileDownloads) {
  Module.expectedDataFileDownloads = 0;
  Module.finishedDataFileDownloads = 0;
}
Module.expectedDataFileDownloads++;
(function() {
 var loadPackage = function(metadata) {

    var PACKAGE_PATH;
    if (typeof window === 'object') {
      PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
    } else if (typeof location !== 'undefined') {
      // worker
      PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
    } else {
      throw 'using preloaded data can only be done on a web page or in a web worker';
    }
    var PACKAGE_NAME = 'game.data';
    var REMOTE_PACKAGE_BASE = 'game.data';
    if (typeof Module['locateFilePackage'] === 'function' && !Module['locateFile']) {
      Module['locateFile'] = Module['locateFilePackage'];
      Module.printErr('warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)');
    }
    var REMOTE_PACKAGE_NAME = typeof Module['locateFile'] === 'function' ?
                              Module['locateFile'](REMOTE_PACKAGE_BASE) :
                              ((Module['filePackagePrefixURL'] || '') + REMOTE_PACKAGE_BASE);
  
    var REMOTE_PACKAGE_SIZE = metadata.remote_package_size;
    var PACKAGE_UUID = metadata.package_uuid;
  
    function fetchRemotePackage(packageName, packageSize, callback, errback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', packageName, true);
      xhr.responseType = 'arraybuffer';
      xhr.onprogress = function(event) {
        var url = packageName;
        var size = packageSize;
        if (event.total) size = event.total;
        if (event.loaded) {
          if (!xhr.addedTotal) {
            xhr.addedTotal = true;
            if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
            Module.dataFileDownloads[url] = {
              loaded: event.loaded,
              total: size
            };
          } else {
            Module.dataFileDownloads[url].loaded = event.loaded;
          }
          var total = 0;
          var loaded = 0;
          var num = 0;
          for (var download in Module.dataFileDownloads) {
          var data = Module.dataFileDownloads[download];
            total += data.total;
            loaded += data.loaded;
            num++;
          }
          total = Math.ceil(total * Module.expectedDataFileDownloads/num);
          if (Module['setStatus']) Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
        } else if (!Module.dataFileDownloads) {
          if (Module['setStatus']) Module['setStatus']('Downloading data...');
        }
      };
      xhr.onload = function(event) {
        var packageData = xhr.response;
        callback(packageData);
      };
      xhr.send(null);
    };

    function handleError(error) {
      console.error('package error:', error);
    };
  
      var fetched = null, fetchedCallback = null;
      fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
        if (fetchedCallback) {
          fetchedCallback(data);
          fetchedCallback = null;
        } else {
          fetched = data;
        }
      }, handleError);
    
  function runWithFS() {

    function assert(check, msg) {
      if (!check) throw msg + new Error().stack;
    }
Module['FS_createPath']('/', 'build', true, true);
Module['FS_createPath']('/', 'lib', true, true);
Module['FS_createPath']('/lib', 'HC', true, true);
Module['FS_createPath']('/lib/HC', 'docs', true, true);
Module['FS_createPath']('/lib', 'hump', true, true);
Module['FS_createPath']('/lib/hump', 'docs', true, true);
Module['FS_createPath']('/lib/hump/docs', '_static', true, true);
Module['FS_createPath']('/lib', 'hxdx', true, true);
Module['FS_createPath']('/lib/hxdx', 'mlib', true, true);

    function DataRequest(start, end, crunched, audio) {
      this.start = start;
      this.end = end;
      this.crunched = crunched;
      this.audio = audio;
    }
    DataRequest.prototype = {
      requests: {},
      open: function(mode, name) {
        this.name = name;
        this.requests[name] = this;
        Module['addRunDependency']('fp ' + this.name);
      },
      send: function() {},
      onload: function() {
        var byteArray = this.byteArray.subarray(this.start, this.end);

          this.finish(byteArray);

      },
      finish: function(byteArray) {
        var that = this;

        Module['FS_createDataFile'](this.name, null, byteArray, true, true, true); // canOwn this data in the filesystem, it is a slide into the heap that will never change
        Module['removeRunDependency']('fp ' + that.name);

        this.requests[this.name] = null;
      },
    };

        var files = metadata.files;
        for (i = 0; i < files.length; ++i) {
          new DataRequest(files[i].start, files[i].end, files[i].crunched, files[i].audio).open('GET', files[i].filename);
        }

  
    function processPackageData(arrayBuffer) {
      Module.finishedDataFileDownloads++;
      assert(arrayBuffer, 'Loading data file failed.');
      assert(arrayBuffer instanceof ArrayBuffer, 'bad input to processPackageData');
      var byteArray = new Uint8Array(arrayBuffer);
      var curr;
      
        // copy the entire loaded file into a spot in the heap. Files will refer to slices in that. They cannot be freed though
        // (we may be allocating before malloc is ready, during startup).
        if (Module['SPLIT_MEMORY']) Module.printErr('warning: you should run the file packager with --no-heap-copy when SPLIT_MEMORY is used, otherwise copying into the heap may fail due to the splitting');
        var ptr = Module['getMemory'](byteArray.length);
        Module['HEAPU8'].set(byteArray, ptr);
        DataRequest.prototype.byteArray = Module['HEAPU8'].subarray(ptr, ptr+byteArray.length);
  
          var files = metadata.files;
          for (i = 0; i < files.length; ++i) {
            DataRequest.prototype.requests[files[i].filename].onload();
          }
              Module['removeRunDependency']('datafile_game.data');

    };
    Module['addRunDependency']('datafile_game.data');
  
    if (!Module.preloadResults) Module.preloadResults = {};
  
      Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
      if (fetched) {
        processPackageData(fetched);
        fetched = null;
      } else {
        fetchedCallback = processPackageData;
      }
    
  }
  if (Module['calledRun']) {
    runWithFS();
  } else {
    if (!Module['preRun']) Module['preRun'] = [];
    Module["preRun"].push(runWithFS); // FS is not initialized yet, wait for it
  }

 }
 loadPackage({"files": [{"audio": 0, "start": 0, "crunched": 0, "end": 7, "filename": "/.gitignore"}, {"audio": 0, "start": 7, "crunched": 0, "end": 11292, "filename": "/main.lua"}, {"audio": 0, "start": 11292, "crunched": 0, "end": 2951196, "filename": "/build/love.dll"}, {"audio": 0, "start": 2951196, "crunched": 0, "end": 3445567, "filename": "/build/LovePeggle.exe"}, {"audio": 0, "start": 3445567, "crunched": 0, "end": 6772423, "filename": "/build/LovePeggle.zip"}, {"audio": 0, "start": 6772423, "crunched": 0, "end": 7210695, "filename": "/build/lua51.dll"}, {"audio": 0, "start": 7210695, "crunched": 0, "end": 7411399, "filename": "/build/mpg123.dll"}, {"audio": 0, "start": 7411399, "crunched": 0, "end": 8071527, "filename": "/build/msvcp120.dll"}, {"audio": 0, "start": 8071527, "crunched": 0, "end": 9034759, "filename": "/build/msvcr120.dll"}, {"audio": 0, "start": 9034759, "crunched": 0, "end": 9544711, "filename": "/build/OpenAL32.dll"}, {"audio": 0, "start": 9544711, "crunched": 0, "end": 10557959, "filename": "/build/SDL2.dll"}, {"audio": 0, "start": 10557959, "crunched": 0, "end": 10561405, "filename": "/lib/HC/class.lua"}, {"audio": 0, "start": 10561405, "crunched": 0, "end": 10566998, "filename": "/lib/HC/gjk.lua"}, {"audio": 0, "start": 10566998, "crunched": 0, "end": 10567564, "filename": "/lib/HC/HC-0.1-1.rockspec"}, {"audio": 0, "start": 10567564, "crunched": 0, "end": 10572137, "filename": "/lib/HC/init.lua"}, {"audio": 0, "start": 10572137, "crunched": 0, "end": 10585670, "filename": "/lib/HC/polygon.lua"}, {"audio": 0, "start": 10585670, "crunched": 0, "end": 10585777, "filename": "/lib/HC/README"}, {"audio": 0, "start": 10585777, "crunched": 0, "end": 10598139, "filename": "/lib/HC/shapes.lua"}, {"audio": 0, "start": 10598139, "crunched": 0, "end": 10602763, "filename": "/lib/HC/spatialhash.lua"}, {"audio": 0, "start": 10602763, "crunched": 0, "end": 10605830, "filename": "/lib/HC/vector-light.lua"}, {"audio": 0, "start": 10605830, "crunched": 0, "end": 10605903, "filename": "/lib/HC/docs/Class.rst"}, {"audio": 0, "start": 10605903, "crunched": 0, "end": 10615297, "filename": "/lib/HC/docs/conf.py"}, {"audio": 0, "start": 10615297, "crunched": 0, "end": 10618096, "filename": "/lib/HC/docs/index.rst"}, {"audio": 0, "start": 10618096, "crunched": 0, "end": 10619401, "filename": "/lib/HC/docs/license.rst"}, {"audio": 0, "start": 10619401, "crunched": 0, "end": 10626567, "filename": "/lib/HC/docs/MainModule.rst"}, {"audio": 0, "start": 10626567, "crunched": 0, "end": 10633960, "filename": "/lib/HC/docs/Makefile"}, {"audio": 0, "start": 10633960, "crunched": 0, "end": 10639536, "filename": "/lib/HC/docs/Polygon.rst"}, {"audio": 0, "start": 10639536, "crunched": 0, "end": 10639916, "filename": "/lib/HC/docs/reference.rst"}, {"audio": 0, "start": 10639916, "crunched": 0, "end": 10647276, "filename": "/lib/HC/docs/Shapes.rst"}, {"audio": 0, "start": 10647276, "crunched": 0, "end": 10651949, "filename": "/lib/HC/docs/SpatialHash.rst"}, {"audio": 0, "start": 10651949, "crunched": 0, "end": 10651985, "filename": "/lib/HC/docs/tutorial.rst"}, {"audio": 0, "start": 10651985, "crunched": 0, "end": 10652069, "filename": "/lib/HC/docs/Vector.rst"}, {"audio": 0, "start": 10652069, "crunched": 0, "end": 10657414, "filename": "/lib/hump/camera.lua"}, {"audio": 0, "start": 10657414, "crunched": 0, "end": 10660438, "filename": "/lib/hump/class.lua"}, {"audio": 0, "start": 10660438, "crunched": 0, "end": 10663972, "filename": "/lib/hump/gamestate.lua"}, {"audio": 0, "start": 10663972, "crunched": 0, "end": 10666191, "filename": "/lib/hump/README.md"}, {"audio": 0, "start": 10666191, "crunched": 0, "end": 10668946, "filename": "/lib/hump/signal.lua"}, {"audio": 0, "start": 10668946, "crunched": 0, "end": 10675301, "filename": "/lib/hump/timer.lua"}, {"audio": 0, "start": 10675301, "crunched": 0, "end": 10678861, "filename": "/lib/hump/vector-light.lua"}, {"audio": 0, "start": 10678861, "crunched": 0, "end": 10684180, "filename": "/lib/hump/vector.lua"}, {"audio": 0, "start": 10684180, "crunched": 0, "end": 10698574, "filename": "/lib/hump/docs/camera.rst"}, {"audio": 0, "start": 10698574, "crunched": 0, "end": 10707635, "filename": "/lib/hump/docs/class.rst"}, {"audio": 0, "start": 10707635, "crunched": 0, "end": 10716971, "filename": "/lib/hump/docs/conf.py"}, {"audio": 0, "start": 10716971, "crunched": 0, "end": 10726095, "filename": "/lib/hump/docs/gamestate.rst"}, {"audio": 0, "start": 10726095, "crunched": 0, "end": 10727397, "filename": "/lib/hump/docs/index.rst"}, {"audio": 0, "start": 10727397, "crunched": 0, "end": 10728702, "filename": "/lib/hump/docs/license.rst"}, {"audio": 0, "start": 10728702, "crunched": 0, "end": 10736103, "filename": "/lib/hump/docs/Makefile"}, {"audio": 0, "start": 10736103, "crunched": 0, "end": 10740377, "filename": "/lib/hump/docs/signal.rst"}, {"audio": 0, "start": 10740377, "crunched": 0, "end": 10752920, "filename": "/lib/hump/docs/timer.rst"}, {"audio": 0, "start": 10752920, "crunched": 0, "end": 10762475, "filename": "/lib/hump/docs/vector-light.rst"}, {"audio": 0, "start": 10762475, "crunched": 0, "end": 10772625, "filename": "/lib/hump/docs/vector.rst"}, {"audio": 0, "start": 10772625, "crunched": 0, "end": 10779599, "filename": "/lib/hump/docs/_static/graph-tweens.js"}, {"audio": 0, "start": 10779599, "crunched": 0, "end": 10882435, "filename": "/lib/hump/docs/_static/in-out-interpolators.png"}, {"audio": 0, "start": 10882435, "crunched": 0, "end": 10979199, "filename": "/lib/hump/docs/_static/interpolators.png"}, {"audio": 0, "start": 10979199, "crunched": 0, "end": 11034675, "filename": "/lib/hump/docs/_static/inv-interpolators.png"}, {"audio": 0, "start": 11034675, "crunched": 0, "end": 11048100, "filename": "/lib/hump/docs/_static/vector-cross.png"}, {"audio": 0, "start": 11048100, "crunched": 0, "end": 11061206, "filename": "/lib/hump/docs/_static/vector-mirrorOn.png"}, {"audio": 0, "start": 11061206, "crunched": 0, "end": 11074974, "filename": "/lib/hump/docs/_static/vector-perpendicular.png"}, {"audio": 0, "start": 11074974, "crunched": 0, "end": 11104881, "filename": "/lib/hump/docs/_static/vector-projectOn.png"}, {"audio": 0, "start": 11104881, "crunched": 0, "end": 11117563, "filename": "/lib/hump/docs/_static/vector-rotated.png"}, {"audio": 0, "start": 11117563, "crunched": 0, "end": 11167586, "filename": "/lib/hxdx/init.lua"}, {"audio": 0, "start": 11167586, "crunched": 0, "end": 11183014, "filename": "/lib/hxdx/mlib/Changes.txt"}, {"audio": 0, "start": 11183014, "crunched": 0, "end": 11198493, "filename": "/lib/hxdx/mlib/LICENSE.md"}, {"audio": 0, "start": 11198493, "crunched": 0, "end": 11239149, "filename": "/lib/hxdx/mlib/mlib.lua"}, {"audio": 0, "start": 11239149, "crunched": 0, "end": 11280918, "filename": "/lib/hxdx/mlib/README.md"}], "remote_package_size": 11280918, "package_uuid": "fd24fc8f-4042-439e-942b-3f2419cd4c55"});

})();
