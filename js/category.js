/**
 * AI Tools Navigation - Category Page
 * 
 * This file handles the category page functionality including:
 * - Loading and displaying tools in a category
 * - Filtering and searching tools
 * - Tool detail modal
 * - Related categories
 */

class AIToolsCategory {
    constructor() {
        this.categories = [];
        this.currentCategory = null;
        this.filteredTools = [];
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.isLoading = false;
        
        // DOM elements
        this.elements = {};
        
        // Initialize the application
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        this.bindElements();
        this.attachEventListeners();
        await this.loadCategories();
        this.loadCurrentCategory();
        this.renderCategory();
        this.renderTools();
        this.renderRelatedCategories();
    }

    /**
     * Bind DOM elements
     */
    bindElements() {
        this.elements = {
            // Header elements
            breadcrumbCurrent: document.getElementById('breadcrumbCurrent'),
            categoryIcon: document.getElementById('categoryIcon'),
            categoryTitle: document.getElementById('categoryTitle'),
            categoryDescription: document.getElementById('categoryDescription'),
            toolCount: document.getElementById('toolCount'),
            recommendedCount: document.getElementById('recommendedCount'),
            
            // Filter elements
            searchInput: document.getElementById('searchInput'),
            filterButtons: document.querySelectorAll('.filter-btn'),
            
            // Content elements
            toolsGrid: document.getElementById('toolsGrid'),
            emptyState: document.getElementById('emptyState'),
            relatedGrid: document.getElementById('relatedGrid'),
            relatedCategories: document.getElementById('relatedCategories'),
            
            // Modal elements
            modalOverlay: document.getElementById('modalOverlay'),
            modalTitle: document.getElementById('modalTitle'),
            modalBody: document.getElementById('modalBody'),
            modalClose: document.getElementById('modalClose'),
            modalCancel: document.getElementById('modalCancel'),
            modalVisit: document.getElementById('modalVisit'),
            
            // Loading
            loadingIndicator: document.getElementById('loadingIndicator')
        };
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Search functionality
        this.elements.searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.filterAndRenderTools();
        });

        // Filter buttons
        this.elements.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active state
                this.elements.filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Update filter
                this.currentFilter = e.target.dataset.filter;
                this.filterAndRenderTools();
            });
        });

        // Tool card clicks
        document.addEventListener('click', (e) => {
            const toolCard = e.target.closest('.tool-card');
            if (toolCard) {
                const toolName = toolCard.dataset.toolName;
                const tool = this.findToolByName(toolName);
                if (tool) {
                    this.showToolModal(tool);
                }
            }
        });

        // Modal controls
        this.elements.modalClose.addEventListener('click', () => this.hideToolModal());
        this.elements.modalCancel.addEventListener('click', () => this.hideToolModal());
        this.elements.modalOverlay.addEventListener('click', (e) => {
            if (e.target === this.elements.modalOverlay) {
                this.hideToolModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideToolModal();
            }
            if (e.key === '/' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                this.elements.searchInput.focus();
            }
        });

        // Related category clicks
        document.addEventListener('click', (e) => {
            const relatedCard = e.target.closest('.related-card');
            if (relatedCard) {
                const categoryId = relatedCard.dataset.categoryId;
                window.location.href = `category.html?id=${categoryId}`;
            }
        });
    }

    /**
     * Load categories data
     */
    async loadCategories() {
        try {
            this.setLoading(true);
            
            // Try multiple possible paths for the JSON file
            const possiblePaths = [
                'data/tools.json',
                './data/tools.json',
                '../data/tools.json',
                'front/data/tools.json'
            ];
            
            let response = null;
            let lastError = null;
            
            for (const path of possiblePaths) {
                try {
                    console.log(`Trying to load data from: ${path}`);
                    response = await fetch(path);
                    if (response.ok) {
                        console.log(`Successfully loaded data from: ${path}`);
                        break;
                    }
                } catch (err) {
                    lastError = err;
                    console.warn(`Failed to load from ${path}:`, err);
                }
            }
            
            if (!response || !response.ok) {
                throw new Error(`Failed to load data from all paths. Last error: ${lastError?.message || 'Unknown error'}`);
            }
            
            const data = await response.json();
            
            if (!data || !data.categories || !Array.isArray(data.categories)) {
                throw new Error('Invalid data format: categories array not found');
            }
            
            this.categories = data.categories;
            console.log(`Loaded ${this.categories.length} categories successfully`);
            
        } catch (error) {
            console.error('Failed to load categories:', error);
            this.showError('加载分类数据失败，请检查网络连接或刷新页面重试');
            
            // Fallback: try to use a minimal dataset
            this.loadFallbackData();
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Load fallback data when main data loading fails
     */
    loadFallbackData() {
        console.log('Loading fallback data...');
        this.categories = [
            {
                id: 'text',
                name: '文本',
                icon: '📝',
                description: 'AI文本处理工具，包括写作助手、翻译工具、内容生成等',
                color: '#FF6B35',
                tools: [
                    {
                        name: 'ChatGPT',
                        description: 'OpenAI开发的强大对话AI，支持多种文本任务',
                        url: 'https://chat.openai.com',
                        recommended: true,
                        level: 'beginner',
                        tags: ['对话', '写作', '翻译']
                    }
                ]
            }
        ];
        console.log('Fallback data loaded');
    }

    /**
     * Load current category from URL
     */
    loadCurrentCategory() {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryId = urlParams.get('id');
        
        if (categoryId) {
            this.currentCategory = this.categories.find(cat => cat.id === categoryId);
        }
        
        if (!this.currentCategory && this.categories.length > 0) {
            // Fallback to first category
            this.currentCategory = this.categories[0];
        }
    }

    /**
     * Render category header
     */
    renderCategory() {
        if (!this.currentCategory) {
            this.showError('未找到指定分类');
            return;
        }

        const category = this.currentCategory;
        const toolCount = category.tools ? category.tools.length : 0;
        const recommendedCount = category.tools ? 
            category.tools.filter(tool => tool.recommended).length : 0;

        // Update page title
        document.title = `${category.name} - AI工具导航`;

        // Update breadcrumb
        this.elements.breadcrumbCurrent.textContent = category.name;

        // Update header
        this.elements.categoryIcon.textContent = category.icon;
        this.elements.categoryTitle.textContent = category.name;
        this.elements.categoryDescription.textContent = category.description;
        this.elements.toolCount.textContent = `${toolCount} 个工具`;
        this.elements.recommendedCount.textContent = `${recommendedCount} 个推荐`;

        // Update header background color
        const categoryHeader = document.querySelector('.category-header');
        if (categoryHeader && category.color) {
            categoryHeader.style.background = `linear-gradient(135deg, ${category.color}15 0%, ${category.color}08 100%)`;
        }
    }

    /**
     * Filter and render tools
     */
    filterAndRenderTools() {
        if (!this.currentCategory || !this.currentCategory.tools) {
            this.filteredTools = [];
            this.renderTools();
            return;
        }

        let tools = [...this.currentCategory.tools];

        // Apply search filter
        if (this.searchQuery) {
            tools = tools.filter(tool => 
                tool.name.toLowerCase().includes(this.searchQuery) ||
                tool.description.toLowerCase().includes(this.searchQuery) ||
                (tool.tags && tool.tags.some(tag => 
                    tag.toLowerCase().includes(this.searchQuery)
                ))
            );
        }

        // Apply category filter
        switch (this.currentFilter) {
            case 'recommended':
                tools = tools.filter(tool => tool.recommended);
                break;
            case 'beginner':
                tools = tools.filter(tool => tool.level === 'beginner');
                break;
            case 'intermediate':
                tools = tools.filter(tool => tool.level === 'intermediate');
                break;
            case 'advanced':
                tools = tools.filter(tool => tool.level === 'advanced');
                break;
            // 'all' case - no additional filtering
        }

        this.filteredTools = tools;
        this.renderTools();
    }

    /**
     * Render tools grid
     */
    renderTools() {
        if (!this.elements.toolsGrid) return;

        if (this.filteredTools.length === 0) {
            this.elements.toolsGrid.style.display = 'none';
            this.elements.emptyState.style.display = 'block';
            return;
        }

        this.elements.toolsGrid.style.display = 'grid';
        this.elements.emptyState.style.display = 'none';

        const toolsHTML = this.filteredTools.map(tool => {
            const badges = [];
            
            if (tool.recommended) {
                badges.push('<span class="tool-badge recommended">推荐</span>');
            }
            
            if (tool.level) {
                const levelText = {
                    'beginner': '初学者',
                    'intermediate': '进阶',
                    'advanced': '高级'
                }[tool.level] || tool.level;
                badges.push(`<span class="tool-badge level-${tool.level}">${levelText}</span>`);
            }

            const tags = tool.tags ? tool.tags.map(tag => 
                `<span class="tool-tag">${tag}</span>`
            ).join('') : '';

            return `
                <div class="tool-card fade-in-up" data-tool-name="${tool.name}">
                    <div class="tool-header">
                        <div class="tool-info">
                            <h3 class="tool-name">${tool.name}</h3>
                            <div class="tool-badges">
                                ${badges.join('')}
                            </div>
                        </div>
                    </div>
                    <p class="tool-description">${tool.description}</p>
                    ${tags ? `<div class="tool-tags">${tags}</div>` : ''}
                    <div class="tool-actions">
                        <button class="btn-secondary" onclick="event.stopPropagation()">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                                <path d="M12 17h.01"/>
                            </svg>
                            详情
                        </button>
                        <a href="${tool.url}" class="btn-primary" target="_blank" onclick="event.stopPropagation()">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                <polyline points="15,3 21,3 21,9"/>
                                <line x1="10" y1="14" x2="21" y2="3"/>
                            </svg>
                            访问
                        </a>
                    </div>
                </div>
            `;
        }).join('');

        this.elements.toolsGrid.innerHTML = toolsHTML;

        // Add staggered animation
        const toolCards = this.elements.toolsGrid.querySelectorAll('.tool-card');
        toolCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 50}ms`;
        });
    }

    /**
     * Render related categories
     */
    renderRelatedCategories() {
        if (!this.elements.relatedGrid || !this.currentCategory) return;

        // Get 3 random categories excluding current one
        const otherCategories = this.categories.filter(cat => cat.id !== this.currentCategory.id);
        const relatedCategories = this.shuffleArray(otherCategories).slice(0, 3);

        if (relatedCategories.length === 0) {
            this.elements.relatedCategories.style.display = 'none';
            return;
        }

        const relatedHTML = relatedCategories.map(category => {
            const toolCount = category.tools ? category.tools.length : 0;
            return `
                <a href="category.html?id=${category.id}" class="related-card" data-category-id="${category.id}">
                    <span class="category-icon">${category.icon}</span>
                    <h4 class="category-name">${category.name}</h4>
                    <p class="category-count">${toolCount} 个工具</p>
                </a>
            `;
        }).join('');

        this.elements.relatedGrid.innerHTML = relatedHTML;
    }

    /**
     * Show tool detail modal
     */
    showToolModal(tool) {
        this.elements.modalTitle.textContent = tool.name;
        this.elements.modalVisit.href = tool.url;

        const badges = [];
        if (tool.recommended) {
            badges.push('<span class="tool-badge recommended">推荐</span>');
        }
        if (tool.level) {
            const levelText = {
                'beginner': '初学者',
                'intermediate': '进阶',
                'advanced': '高级'
            }[tool.level] || tool.level;
            badges.push(`<span class="tool-badge level-${tool.level}">${levelText}</span>`);
        }

        const tags = tool.tags ? tool.tags.map(tag => 
            `<span class="tool-tag">${tag}</span>`
        ).join('') : '';

        // 构建优势列表
        const prosHTML = tool.pros ? `
            <div style="margin-bottom: 20px;">
                <h4 style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">✅ 主要优势</h4>
                <ul style="margin: 0; padding-left: 20px; color: var(--text-secondary);">
                    ${tool.pros.map(pro => `<li style="margin-bottom: 4px;">${pro}</li>`).join('')}
                </ul>
            </div>
        ` : '';

        // 构建劣势列表
        const consHTML = tool.cons ? `
            <div style="margin-bottom: 20px;">
                <h4 style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">⚠️ 注意事项</h4>
                <ul style="margin: 0; padding-left: 20px; color: var(--text-secondary);">
                    ${tool.cons.map(con => `<li style="margin-bottom: 4px;">${con}</li>`).join('')}
                </ul>
            </div>
        ` : '';

        // 构建学习资源列表
        const learningHTML = tool.learningResources ? `
            <div style="margin-bottom: 20px;">
                <h4 style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">📚 学习资源</h4>
                <ul style="margin: 0; padding-left: 20px; color: var(--text-secondary);">
                    ${tool.learningResources.map(resource => {
                        const parts = resource.split(': ');
                        if (parts.length === 2) {
                            return `<li style="margin-bottom: 4px;"><strong>${parts[0]}:</strong> <a href="${parts[1]}" target="_blank" style="color: var(--primary-color); text-decoration: none;">${parts[1]}</a></li>`;
                        }
                        return `<li style="margin-bottom: 4px;">${resource}</li>`;
                    }).join('')}
                </ul>
            </div>
        ` : '';

        this.elements.modalBody.innerHTML = `
            <div class="tool-badges" style="margin-bottom: 16px;">
                ${badges.join('')}
            </div>
            <p style="font-size: 16px; line-height: 1.6; color: var(--text-secondary); margin-bottom: 20px;">
                ${tool.description}
            </p>
            ${tags ? `
                <div style="margin-bottom: 20px;">
                    <h4 style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">🏷️ 标签</h4>
                    <div class="tool-tags">${tags}</div>
                </div>
            ` : ''}
            ${prosHTML}
            ${consHTML}
            ${learningHTML}
            <div style="margin-bottom: 20px;">
                <h4 style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">🔗 官方网站</h4>
                <a href="${tool.url}" target="_blank" style="color: var(--primary-color); text-decoration: none; word-break: break-all;">
                    ${tool.url}
                </a>
            </div>
        `;

        this.elements.modalOverlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Hide tool detail modal
     */
    hideToolModal() {
        this.elements.modalOverlay.classList.remove('show');
        document.body.style.overflow = '';
    }

    /**
     * Find tool by name
     */
    findToolByName(name) {
        if (!this.currentCategory || !this.currentCategory.tools) return null;
        return this.currentCategory.tools.find(tool => tool.name === name);
    }

    /**
     * Shuffle array
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Set loading state
     */
    setLoading(loading) {
        this.isLoading = loading;
        
        if (loading) {
            this.elements.loadingIndicator.classList.add('show');
        } else {
            this.elements.loadingIndicator.classList.remove('show');
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.innerHTML = `
            <div class="toast-content">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <span>${message}</span>
            </div>
        `;

        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => {
                    toast.parentNode.removeChild(toast);
                }, 300);
            }
        }, 5000);
    }

    /**
     * Initialize with initial filter
     */
    initializeFilters() {
        this.filterAndRenderTools();
    }
}

// Utility functions
const Utils = {
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    isMobile() {
        return window.innerWidth <= 768;
    },

    getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    }
};

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.aiToolsCategory = new AIToolsCategory();
    
    // Handle online/offline status
    window.addEventListener('online', () => {
        console.log('网络连接已恢复');
    });
    
    window.addEventListener('offline', () => {
        console.log('网络连接已断开');
    });
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AIToolsCategory, Utils };
}