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
                width: 600,
                height: 400,
                topbarName: 'Terminal'
            },
            'v86 Subsystem': {
                url: './apps/v86shell.html',
                width: 600,
                height: 400,
                topbarName: 'v86 Subsystem'
            },
            'Snake': {
                url: './apps/snake.html',
                width: 300,
                height: 400,
                topbarName: 'Snake'
            },
            'Text Editor': {
                url: './apps/texteditor.html',
                width: 700,
                height: 500,
                topbarName: 'Text Editor'
            },
            'Image Viewer': {
                url: './apps/imageviewer.html',
                width: 700,
                height: 500,
                topbarName: 'Image Viewer'
            },
            'Settings': {
                url: './apps/settings.html',
                width: 600,
                height: 400,
                topbarName: 'Settings'
            },
            'About': {
                url: './apps/about.html',
                width: 500,
                height: 300,
                topbarName: 'About'
            },
            'DOOM': {
                url: './apps/doom.html',
                width: 800,
                height: 600,
                topbarName: 'DOOM'
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
            const menuWidth = appsMenu.offsetWidth || 200;
            const menuHeight = appsMenu.offsetHeight || 300;
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const taskbarHeight = 30;

            let left = rect.left;
            let bottom = windowHeight - rect.top + 2;

            if (left + menuWidth > windowWidth) {
                left = windowWidth - menuWidth - 5;
            }

            if (left < 0) {
                left = 5;
            }

            if (rect.top - menuHeight < 25){
                appsMenu.style.top = `${rect.bottom + 2}px`;
                appsMenu.style.bottom = 'auto';
            } else {
                appsMenu.style.bottom = `${bottom}px`;
                appsMenu.style.top = 'auto';
            }

            appsMenu.style.left = `${left}px`;
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

            // const secBtn = document.createElement('button');
            // secBtn.className = 'tb-button';
            // secBtn.textContent = 'File';

            // const lines = tb.querySelector('.topbar-lines');
            // tb.insertBefore(secBtn, lines);
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
                    submenu.style.display = 'flex';
                    positionSubmenu(submenu, trigger);
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

        function positionSubmenu(submenu, parentItem) {
            const rect = parentItem.getBoundingClientRect();
            const submenuWidth = submenu.offsetWidth;
            const submenuHeight = submenu.offsetHeight;
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const taskbarHeight = 33.5;
            const topbarHeight = 25;

            let left = rect.right + 2;
            let top = rect.top;

            if (left + submenuWidth > windowWidth) {
                left = rect.left - submenuWidth - 2;
            }

            if (left < 0) {
                left = 5;
            }

            if (top + submenuHeight > windowHeight - taskbarHeight) {
                top = windowHeight - taskbarHeight - submenuHeight;
            }

            if (top < topbarHeight) {
                top = topbarHeight;
            }

            submenu.style.left = `${left}px`;
            submenu.style.top = `${top}px`;
            submenu.style.bottom = 'auto';
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

            windowEl.style.position = 'absolute';
            windowEl.style.left = Math.max(0, (window.innerWidth - config.width) / 2) + 'px';
            windowEl.style.top = Math.max(25, 25 + (window.innerHeight - 55 - config.height) / 2) + 'px';
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
                    <iframe src="${config.url}" allow="fullscreen; autoplay; pointer-lock" style="width: 100%; height: 100%; border: none;></iframe>
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

        document.addEventListener('click', (e) => {
            const window = e.target.closest('.window');
            if (window && window.classList.contains('active')) {
                const iframe = window.querySelector('iframe');
                if (iframe && e.target.closest('.iframe-container')) {
                    iframe.contentWindow.focus();
                }
            }
        });

        appsMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        document.querySelectorAll('.submenu').forEach(submenu => {
            submenu.addEventListener('click', (e) => e.stopPropagation());
        });

        