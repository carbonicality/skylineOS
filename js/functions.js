        // app configuration
        const APP_CONFIGS = {
            'File Manager': {
                url: './apps/filemanager.html',
                width: 800,
                height: 600,
                topbarName: 'File Manager'
            },
            'Terminal': {
                url: './apps/terminal.html',
                width: 800,
                height: 600,
                topbarName: 'Terminal'
            }
        };

        let openWindows = new Map();
        
        // time display logic
        function updateDT() {
            const now = new Date();

            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            document.getElementById('time').textContent = `${hours}:${minutes}`;

            const day = now.getDate();
            const month = now.getMonth() + 1;
            const year = now.getFullYear().toString().slice(-2);
            document.getElementById('date').textContent = `${day}/${month}/${year}`;
        }

        updateDT();
        setInterval(updateDT, 30000)

        // universal reboot which js goes to shutdown and then bootloader
        function reboot() {
            window.location = 'shutdown.html';
        }

        function getHighestZIndex() {
            const windows = document.querySelectorAll('.window');
            let highest = 100;
            windows.forEach(w => {
                const z = parseInt(w.style.zIndex) || 100;
                if (z > highest) highest = z;
            });
            return highest;
        }

        function hideAllMenus() {
            const contextMenuLgn = document.querySelector('.context-menu-lgn');
            const appsMenu = document.getElementById('apps-menu');
            const submenus = document.querySelectorAll('.submenu');

            contextMenuLgn.style.display = 'none';
            appsMenu.style.display = 'none';
            submenus.forEach(submenu => submenu.style.display = 'none');

            document.getElementById('tb-main-btn').classList.remove('active');
            document.getElementById('apps-btn').classList.remove('active');
        }

        // context menu stuff for desktop button
        const tbMainBtn = document.getElementById('tb-main-btn');
        const contextMenuLgn = document.querySelector('.context-menu-lgn');

        function showContextLgn() {
            hideAllMenus();
            const rect = tbMainBtn.getBoundingClientRect();
            contextMenuLgn.style.left = `${rect.left}px`;
            contextMenuLgn.style.top = `${rect.bottom}px`;
            contextMenuLgn.style.display = 'flex';
            tbMainBtn.classList.add('active');
        }

        tbMainBtn.addEventListener('click', () => {
            if (contextMenuLgn.style.display === 'flex') {
                hideAllMenus();
            } else {
                showContextLgn();
            }
        });

        const appsBtn = document.getElementById('apps-btn');
        const appsMenu = document.getElementById('apps-menu');

        function showAppsMenu() {
            hideAllMenus();
            const rect = appsBtn.getBoundingClientRect();
            appsMenu.style.left = `${rect.left}px`;
            appsMenu.style.bottom = `${window.innerHeight - rect.top + 2}px`;
            appsMenu.style.display = 'flex';
            appsBtn.classList.add('active');
        }

        function hideTbMenus() {
            const menu = document.getElementById('tb-menu');
            if (menu) {
                menu.remove();
            }
        }

        function resetTb() {
            const tb = document.querySelector('.topbar');

            const mainBtn = document.getElementById('tb-main-btn');
            mainBtn.textContent = 'Desktop';

            const btns = tb.querySelectorAll('.tb-button');
            btns.forEach(btn => btn.remove());

            const secBtn = document.createElement('button');
            secBtn.className = 'tb-button';
            secBtn.textContent = 'File';

            const lines = tb.querySelector('.topbar-lines');
            tb.insertBefore(secBtn, lines);
        }

        function showTbMenu(btn, items) {
            hideTbMenus();

            const menu = document.createElement('div');
            menu.className = 'context-menu-apps';
            menu.id = 'tb-menu';

            items.forEach(item => {
                const menuItem = document.createElement('button');
                menuItem.className = 'menu-item';
                menuItem.innerHTML = `
                    <div class="context-menu-thing"></div>
                    <span class="m-text">${item.name}</span>
                `;
                menuItem.onclick = () => {
                    item.action();
                    hideTbMenus();
                };
                menu.appendChild(menuItem);

                const rect = btn.getBoundingClientRect();
                menu.style.left = `${rect.left}px`;
                menu.style.top = `${rect.bottom}px`;
                menu.style.display = `flex`;

                document.body.appendChild(menu);
            })
        }

        function updateTb(config) {
            const tb = document.querySelector('.topbar');

            const mainBtn = document.getElementById('tb-main-btn');
            if (config.topbarName) {
                mainBtn.textContent = config.topbarName;
            }

            const btns = tb.querySelectorAll('.tb-button');
            btns.forEach(btn => btn.remove());

            if (config.topbarButtons) {
                config.topbarButtons.forEach(btnConfig => {
                    const btn = document.createElement('button');
                    btn.className = 'tb-button';
                    btn.textContent = btnConfig.name;
                    btn.setAttribute('data-menu', btnConfig.name.toLowerCase());

                    const lines = tb.querySelector('.topbar-lines');
                    tb.insertBefore(btn, lines);

                    btn.addEventListener('click', (e) => {
                        showTbMenu(e.target, btnConfig.items);
                    })
                })
            }
        }

        appsBtn.addEventListener('click', () => {
            if (appsMenu.style.display === 'flex') {
                hideAllMenus();
            } else {
                showAppsMenu();
            }
        });

        const submenuTriggers = document.querySelectorAll('[data-submenu]');
        let activeSubmenu = null;
        let submenuTimeout = null;

        submenuTriggers.forEach(trigger => {
            trigger.addEventListener('mouseenter', () => {
                clearTimeout(submenuTimeout);
                const submenuName = trigger.getAttribute('data-submenu');
                const submenu = document.getElementById(submenuName + '-submenu');

                document.querySelectorAll('.submenu').forEach(sub => {
                    if (sub !== submenu) sub.style.display = 'none';
                });

                if (submenu) {
                    const triggerRect = trigger.getBoundingClientRect();
                    submenu.style.left = `${triggerRect.right - 2}px`;
                    submenu.style.top = `${triggerRect.top}px`;
                    submenu.style.display = 'flex';
                    activeSubmenu = submenu;
                }
            });

            trigger.addEventListener('mouseleave', () => {
                submenuTimeout = setTimeout(() => {
                    if (activeSubmenu && !activeSubmenu.matches(':hover')) {
                        activeSubmenu.style.display = 'none';
                        activeSubmenu = null;
                    }
                }, 200);
            });
        });

        document.querySelectorAll('.submenu').forEach(submenu => {
            submenu.addEventListener('mouseenter', () => {
                clearTimeout(submenuTimeout);
            });

            submenu.addEventListener('mouseleave', () => {
                submenuTimeout = setTimeout(() => {
                    submenu.style.display = 'none';
                    if (activeSubmenu === submenu) {
                        activeSubmenu = null;
                    }
                }, 200);
            });
        });

        document.addEventListener('click', (e) => {
            // check if click is on 'desktop'
            if (e.target === document.body) {
                const activeWindow = document.querySelector('.window-active');
                if (!activeWindow) {
                    resetTb();
                }
            } 

            if (!contextMenuLgn.contains(e.target) && e.target !== tbMainBtn &&
                !appsMenu.contains(e.target) && e.target !== appsBtn &&
                !Array.from(document.querySelectorAll('.submenu')).some(submenu => submenu.contains(e.target)) &&
                !e.target.classList.contains('tb-button') && 
                !document.getElementById('tb-menu')?.contains(e.target)) {
                    hideAllMenus();
                    hideTbMenus();
                }
            });

        function focusWindow(windowId) {
            // creates all inactive at first
            document.querySelectorAll('.window').forEach(win => {
                win.classList.remove('active');
                win.classList.add('inactive');
            })

            const focusedWindow = document.getElementById(windowId);
            if (focusedWindow) {
                focusedWindow.classList.remove('inactive');
                focusedWindow.classList.add('active');

                const windowData = openWindows.get(windowId);
                if (windowData && windowData.config) {
                    updateTb(windowData.config);
                }
            }

            openWindows.forEach((window, id) => {
                const button = document.getElementById(`taskbar-${id}`);
                if (button) {
                    if (id === windowId && !window.minimised) {
                        button.classList.add('active');
                    } else {
                        button.classList.remove('active');
                    }
                }
            });
        }

        function minimiseWindow(windowId) {
            const windowEl = document.getElementById(windowId);
            const windowData = openWindows.get(windowId);
            windowEl.classList.add('minimised');
            windowEl.classList.add('inactive');
            windowData.minimised = true;

            const button = document.getElementById(`taskbar-${windowId}`);
            if (button) {
                button.classList.remove('active');
            }
        }

        function restoreWindow(windowId) {
            const windowEl = document.getElementById(windowId);
            const windowData = openWindows.get(windowId);

            if (windowEl && windowData) {
                if (windowData.minimised) {
                    windowEl.classList.remove('minimised');
                    windowData.minimised = false;
                    windowEl.style.zIndex = getHighestZIndex() + 1;
                    focusWindow(windowId);
                } else {
                    windowEl.style.zIndex = getHighestZIndex() + 1;
                    focusWindow(windowId)
                }
            }
        }

        function closeWindow(windowId) {
            const windowEl = document.getElementById(windowId);
            windowEl.remove();
            openWindows.delete(windowId);
            removeFromTaskbar(windowId);

            if (openWindows.size === 0) {
                resetTb();
            } else {
                const remainingWindows = Array.from(openWindows.keys());
                if (remainingWindows.length > 0) {
                    focusWindow(remainingWindows[0]);
                }
            }
        }
        
        function addToTaskbar(windowId, appName) {
            const taskbarApps = document.getElementById('taskbar-apps');
            const button = document.createElement('button');
            button.className = 'tbBtn active';
            button.id = `taskbar-${windowId}`;
            button.textContent = appName;
            button.onclick = () => restoreWindow(windowId);
            taskbarApps.appendChild(button);
        }

        function removeFromTaskbar(windowId) {
            const button = document.getElementById(`taskbar-${windowId}`);
            if (button) button.remove();
        } 

        document.addEventListener('mousedown', (e) => {
            const window = e.target.closest('.window');
            if (window) {
                window.style.zIndex = getHighestZIndex() + 1;
                focusWindow(window.id);
            }
        });

        function makeWindowDraggable(windowEl) {
            const titlebar = windowEl.querySelector('.titlebar');
            let isDragging = false;
            let startX, startY, startLeft, startTop;

            titlebar.addEventListener('mousedown', (e) => {
                if (e.target.closest('.window-controls') || e.target.closest('.control-btn')) {
                    e.stopPropagation;
                    return;
                }

                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;

                const rect = windowEl.getBoundingClientRect();
                startLeft = rect.left;
                startTop = rect.top;

                windowEl.style.transform = 'none';
                windowEl.style.zIndex = getHighestZIndex() + 1;
                focusWindow(windowEl.id);

                document.addEventListener('mousemove', drag);
                document.addEventListener('mouseup', stopDrag);
                e.preventDefault();
            });

            function drag(e) {
                if (!isDragging) return;

                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;

                let newLeft = startLeft + deltaX;
                let newTop = startTop + deltaY;

                const windowWidth = windowEl.offsetWidth;
                const windowHeight = windowEl.offsetHeight;
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                const topbarHeight = 25;
                const taskbarHeight = 30;
                const titlebarHeight = 30;

                newLeft = Math.max(-windowWidth / 2, newLeft);
                newLeft = Math.min(viewportWidth - windowWidth / 2, newLeft);
                newTop = Math.max(topbarHeight, newTop); // top bounds
                newTop = Math.min(viewportHeight - taskbarHeight - titlebarHeight, newTop);

                windowEl.style.left = newLeft + 'px';
                windowEl.style.top = newTop + 'px';
            }

            function stopDrag() {
                isDragging = false;
                document.removeEventListener('mousemove', drag);
                document.removeEventListener('mouseup', stopDrag);
            }
        }

        function toggleMaximise(windowId) {
            const windowEl = document.getElementById(windowId);
            windowEl.classList.toggle('maximised');
        }

        function makeWindowResizable(windowEl) {
            const MIN_WIDTH = 300;
            const MIN_HEIGHT = 200;
    
            const handles = windowEl.querySelectorAll('.resize-handle');
    
            handles.forEach(handle => {
                handle.onmousedown = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
            
                    const direction = Array.from(this.classList).find(cls => cls !== 'resize-handle');
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const rect = windowEl.getBoundingClientRect();
            
                    const cursors = {
                        'n': 'n-resize',
                        's': 's-resize', 
                        'e': 'e-resize', 
                        'w': 'w-resize',
                        'ne': 'ne-resize', 
                        'nw': 'nw-resize', 
                        'se': 'se-resize', 
                        'sw': 'sw-resize'
                    };
                    document.body.style.cursor = cursors[direction];
            
                    document.onmousemove = function(moveEvent) {
                        const dx = moveEvent.clientX - startX;
                        const dy = moveEvent.clientY - startY;
                
                        let width = rect.width;
                        let height = rect.height;
                        let left = rect.left;
                        let top = rect.top;
                
                        if (direction.includes('e')) width = Math.max(MIN_WIDTH, rect.width + dx);
                        if (direction.includes('w')) {
                            width = Math.max(MIN_WIDTH, rect.width - dx);
                            left = rect.left + (rect.width - width);
                        }
                        if (direction.includes('s')) height = Math.max(MIN_HEIGHT, rect.height + dy);
                        if (direction.includes('n')) {
                            height = Math.max(MIN_HEIGHT, rect.height - dy);
                            top = rect.top + (rect.height - height);
                        }
                
                        windowEl.style.width = width + 'px';
                        windowEl.style.height = height + 'px';
                        windowEl.style.left = left + 'px';
                        windowEl.style.top = top + 'px';
                    };
            
                    document.onmouseup = function() {
                        document.onmousemove = null;
                        document.onmouseup = null;
                        document.body.style.cursor = '';
                    };
                };
            });
        }


        function startResize(e, windowEl, direction) {
            e.preventDefault();
            e.stopPropagation();

            const MIN_WIDTH = 100;
            const MIN_HEIGHT = 50;

            const startX = e.clientX;
            const startY = e.clientY;

            const rect = windowEl.getBoundingClientRect();
            const startWidth = rect.width;
            const startHeight = rect.height;
            const startLeft = rect.left;
            const startTop = rect.top;

            function onMouseMove(ev) {
                const dx = ev.clientX - startX;
                const dy = ev.clientY - startY;

                let newWidth = startWidth;
                let newHeight = startHeight;
                let newLeft = startLeft;
                let newTop = startTop;

                if (direction.includes('e')) {
                    newWidth = Math.max(MIN_WIDTH, startWidth + dx);
                }
                if (direction.includes('w')) {
                    newWidth = Math.max(MIN_WIDTH, startWidth - dx);
                    newLeft = startLeft + (startWidth - newWidth);
                }
                if (direction.includes('s')) {
                    newHeight = Math.max(MIN_HEIGHT, startHeight + dy);
                }
                if (direction.includes('n')) {
                    newHeight = Math.max(MIN_HEIGHT, startHeight - dy);
                    newTop = startTop + (startHeight - newHeight);
                }

                windowEl.style.width = newWidth + 'px';
                windowEl.style.height = newHeight + 'px';
                windowEl.style.left = newLeft + 'px';
                windowEl.style.top = newTop + 'px';
            }

            function onMouseUp() {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                document.body.style.cursor = '';
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);

            document.body.style.cursor = getComputedStyle(e.target).cursor;
        }

        function launchApp(appName) {
            const config = APP_CONFIGS[appName] || { url: 'about:blank', width: 600, height: 400 };
            const windowId = `window-${Date.now()}`;

            const windowEl = document.createElement('div');
            windowEl.className = 'window';
            windowEl.id = windowId;
            windowEl.style.width = config.width + 'px';
            windowEl.style.height = config.height + 'px';
            windowEl.style.zIndex = getHighestZIndex() + 1;
            // note to self: eventually change these to icon buttons instead of using unicode symbols
            windowEl.innerHTML = `
                <div class="titlebar">
                    ${appName}
                    <div class="titlebar-lines"></div>
                    <div class="window-controls">
                        <button class="control-btn minimise-btn" onclick="minimiseWindow('${windowId}')">-</button>
                        <button class="control-btn maximise-btn" onclick="toggleMaximise('${windowId}')">□</button>
                        <button class="control-btn close-btn" onclick="closeWindow('${windowId}')">×</button>
                    </div>
                </div>
                <div class="iframe-container">
                    <iframe src="${config.url}"></iframe>
                </div>

                <div class="resize-handle nw"></div>
                <div class="resize-handle ne"></div>
                <div class="resize-handle sw"></div>
                <div class="resize-handle se"></div>
                <div class="resize-handle n"></div>
                <div class="resize-handle s"></div>
                <div class="resize-handle e"></div>
                <div class="resize-handle w"></div>
            `;

            document.body.appendChild(windowEl);
            makeWindowDraggable(windowEl);
            makeWindowResizable(windowEl);

            openWindows.set(windowId, {
                name: appName,
                element: windowEl,
                minimised: false,
                config: config
            });

            windowEl.className = 'window active';
            focusWindow(windowId);
            updateTb(config);
            addToTaskbar(windowId, appName);
            hideAllMenus();
        }