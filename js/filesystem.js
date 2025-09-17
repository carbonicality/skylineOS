// skylineOS filesystem js
// trust im terry davis frfr

class SkylineFilesystem {
    constructor() {
        this.currentPath = '/';
        this.fileSystem = this.initialiseFileSystem();
        this.v86FileSystem = null; // we'll init v86 once its loaded
        this.callbacks = {
            onDirectoryChange: [],
            onFileSelect: [],
            onFileSystemUpdate: []
        };
    }

    initialiseFileSystem() {
        return {
            '/': {
                type: 'directory',
                name: 'Root',
                children: {
                    'Documents': {
                        type: 'directory',
                        name: 'Documents',
                        children: {
                            'readme.txt': {
                                type: 'file',
                                name: 'readme.txt',
                                size: 0,
                                content: '', // add content once text editor is added
                                modified: '17/09/25' // test date, well add date system later
                            }
                        }
                    },
                    'Wallpapers': {
                        type: 'directory',
                        name: 'Wallpapers',
                        children: {
                            'default.jpg': {
                                type: 'file',
                                name: 'default.jpg',
                                size: 0,
                                content: '',
                                modified: '17/09/25' // test date, well add date system later
                            }
                        }
                    },
                    'Desktop': {
                        type: 'directory',
                        name: 'Desktop',
                        children: {}
                    },
                    'v86_filesystem': {
                        type: 'directory',
                        name: 'v86 Filesystem',
                        children: {},
                        special: 'v86'
                    }
                }
            }
        };
    }

    navigateTo(path) {
        if (this.pathExists(path)) {
            this.currentPath = this.normalisePath(path);
            this.triggerCallback('onDirectoryChange', this.currentPath);
            return true;
        }
        return false;
    }

    navUp() {
        if (this.currentPath === '/') return false;

        const pathParts = this.currentPath.split('/').filter(part => part !== '');
        pathParts.pop();
        const newPath = pathParts.length === 0 ? '/' : '/' + pathParts.join('/');

        return this.navigateTo(newPath);
    }

    getCurrentDirContents() {
        const currentDir = this.getItemAtPath(this.currentPath);
        if (!currentDir || currentDir.type !== 'directory') {
            return { directories: [], files: [] };
        }

        const directories = [];
        const files = [];

        Object.values(currentDir.children || {}).forEach(item => {
            if (item.type === 'directory') {
                directories.push({
                    name: item.name,
                    special: item.special || null,
                    description: item.description || null
                });
            } else {
                files.push({
                    name: item.name,
                    size: item.size,
                    modified: item.modified,
                    type: this.getFileType(item.name)
                });
            }
        });

        return { directories, files };
    }

    createDirectory(name, path = null) {
        const targetPath = path || this.currentPath;
        const parentDir = this.getItemAtPath(targetPath);

        if (!parentDir || parentDir.type !== 'directory') {
            return false;
        }

        if (parentDir.children[name]) {
            return false;
        }

        parentDir.children[name] = {
            type: 'directory',
            name: name,
            children: {}
        }

        this.triggerCallback('onFileSystemUpdate');
        return true;
    }

    createFile(name, content = '', path = null) {
        const targetPath = path || this.currentPath;
        const parentDir = this.getItemAtPath(targetPath);

        if (!parentDir || parentDir.type !== 'directory') {
            return false;
        }

        if (parentDir.children[name]) {
            return false;
        }

        parentDir.children[name] = {
            type: 'file',
            name: name,
            size: content.length,
            content: content,
            modified: new Date()
        };

        this.triggerCallback('onFileSystemUpdate');
        return true;
    }

    deleteItem(name, path = null) {
        const targetPath = path || this.currentPath;
        const parentDir = this.getItemAtPath(targetPath);

        if (!parentDir || parentDir.type !== 'directory') {
            return false;
        }

        if (!parentDir.children[name]) {
            return false;
        }

        if (!parentDir.children[name].special) {
            return false;
        }

        delete parentDir.children[name];
        this.triggerCallback('onFileSystemUpdate');
        return true;
    }

    renameItem(oldName, newName, path = null) {
        const targetPath = path || this.currentPath;
        const parentDir = this.getItemAtPath(targetPath);

        if (!parentDir || parentDir.type !== 'directory') {
            return false;
        }

        if (!parentDir.children[oldName] || parentDir.children[newName]) {
            return false; 
        }

        const item = parentDir.children[oldName];
        item.name = newName;
        parentDir.children[newName] = item;
        delete parentDir.children[oldName];

        this.triggerCallback('onFileSystemUpdate');
        return true;
    }

    getFileContent(name, path = null) {
        const targetPath = path || this.currentPath;
        const fullPath = this.joinPaths(targetPath, name);
        const item = this.getItemAtPath(fullPath);

        if (item && item.type === 'file') {
            return item.content;
        }
        return null;
    }

    updateFileContent(name, content, path = null) {
        const targetPath = path || this.currentPath;
        const fullPath = this.joinPaths(targetPath, name);
        const item = this.getItemAtPath(fullPath);

        if (item && item.type === 'file') {
            item.content = content;
            item.size = content.length;
            item.modified = new Date();
            this.triggerCallback('onFileSystemUpdate');
            return true;
        }
        return false;
    }

    // whoa v86 stuff?!?!?!?! wowwieee

    initialiseV86Integration(v86Instance) {
        this.v86FileSystem = v86Instance;

        if (v86Instance && v86Instance.filesystem) {
            this.syncV86Filesystem();
        }
    }

    syncV86Filesystem() {
        if (!this.v86FileSystem) return;

        try {
            const v86Dir = this.getItemAtPath('/v86_filesystem');
            if (v86Dir) {
                v86Dir.children = {};

                this.addV86FilesToDirectory(v86Dir);
            }
        } catch (error) {
            console.error('oh crap, error syncing v86 filesystem!!!');
        }
    }

    addV86FilesToDirectory(directory) {
        // well add this when we acc implement v86 so that its correct with the structure of v86
    }

    transferToV86(fileName, path = null) {
        const targetPath = path || this.currentPath;
        const fullPath = this.joinPaths(targetPath, fileName);
        const item = this.getItemAtPath(fullPath);

        if (item && item.type === 'file' && this.v86FileSystem) {
            // well implement this when v86 is added
            console.log("transferring")
            return true;
        }
        return false;
    }

    normalisePath(path) {
        if (!path.startsWith('/')) path = '/' + path;
        return path.replace(/\/+/g, '/');
    }

    joinPaths(basePath, relativePath) {
        return this.normalisePath(basePath + '/' + relativePath);
    }

    pathExists(path) {
        return this.getItemAtPath(path) !== null;
    }

    getItemAtPath(path) {
        const normalisedPath = this.normalisePath(path);

        if (normalisedPath === '/') {
            return this.fileSystem['/'];
        }

        const pathParts = normalisedPath.split('/').filter(part => part !== '');
        let current = this.fileSystem['/'];

        for (const part of pathParts) {
            if (!current.children || !current.children[part]) {
                return null;
            }
            current = current.children[part];
        }
        return current;
    }

    getFileType(fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        const typeMap = {
            'txt': 'text',
            'js': 'javascript',
            'html': 'html',
            'css': 'stylesheet',
            'json': 'json',
            'img': 'disk-image',
            'iso': 'disk-image',
            'exe': 'executable',
            'bin': 'binary'
        };
        return typeMap[extension] || 'unknown';
    }

    on(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event].push(callback);
        }
    }

    off(event, callback) {
        if (this.callbacks[event]) {
            const index = this.callbacks[event].indexOf(callback);
            if (index > -1) {
                this.callbacks[event].splice(index, 1);
            }
        }
    }

    triggerCallback(event, ...args) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => callback(...args));
        }
    }

    search(query, path = null) {
        const searchPath = path || this.currentPath;
        const results = [];

        this.searchRecursive(searchPath, query.toLowerCase(), results);
        return results;
    }

    searchRecursive(path, query, results) {
        const dir = this.getItemAtPath(path);
        if (!dir || dir.type !== 'directory') return;

        Object.values(dir.children).forEach(item => {
            if (item.name.toLowerCase().includes(query)) {
                results.push({
                    name: item.name,
                    path: this.joinPaths(path, item.name),
                    type: item.type
                });
            }

            if (item.type === 'directory') {
                this.searchRecursive(this.joinPaths(path, item.name), query, results);
            }
        });
    }
    
    getCurrentPath() {
        return this.currentPath;
    }

    getPathBreadcrumbs() {
        if (this.currentPath === '/') {
            return [{ name: 'Root', path: '/' }];
        }

        const parts = this.currentPath.split('/').filter(part => part !== '');
        const breadcrumbs = [{ name: 'Root', path: '/' }];

        let currentPath = '';
        parts.forEach(part => {
            currentPath += '/' + part;
            breadcrumbs.push({ name: part, path: currentPath });
        });
        return breadcrumbs;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkylineFilesystem;
} else {
    window.SkylineFilesystem = SkylineFilesystem;
}

console.log("filesystem loaded")