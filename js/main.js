/**
 * AI Tools Navigation - Main Page
 * 
 * This file handles the main page functionality including:
 * - Loading and displaying tool categories
 * - Category navigation
 * - Responsive interactions
 */

class AIToolsMain {
    constructor() {
        this.categories = [];
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
        this.renderCategories();
        // Animation setup is now handled in initializeFilters()
    }

    /**
     * Bind DOM elements
     */
    bindElements() {
        this.elements = {
            categoriesGrid: document.getElementById('categoriesGrid'),
            loadingIndicator: document.getElementById('loadingIndicator'),
            navLinks: document.querySelectorAll('.nav-link')
        };
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Handle category card clicks
        document.addEventListener('click', (e) => {
            const categoryCard = e.target.closest('.category-card');
            if (categoryCard) {
                const categoryId = categoryCard.dataset.categoryId;
                this.navigateToCategory(categoryId);
            }
        });

        // Handle navigation
        this.elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Update active state
                this.elements.navLinks.forEach(l => l.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Handle window resize
        window.addEventListener('resize', Utils.debounce(() => {
            this.handleResize();
        }, 250));
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
            },
            {
                id: 'image',
                name: '图像',
                icon: '🖼️',
                description: 'AI图像生成、编辑和处理工具，让创意变为现实',
                color: '#F7931E',
                tools: [
                    {
                        name: 'Midjourney',
                        description: '顶级AI图像生成工具，艺术质量极高',
                        url: 'https://www.midjourney.com',
                        recommended: true,
                        level: 'intermediate',
                        tags: ['图像生成', '艺术', '创意']
                    }
                ]
            },
            {
                id: 'video',
                name: '视频',
                icon: '🎬',
                description: 'AI视频生成、编辑和处理工具，轻松制作专业视频',
                color: '#FF8C42',
                tools: []
            },
            {
                id: 'audio',
                name: '音频',
                icon: '🎵',
                description: 'AI音频生成、编辑和处理工具，创造美妙声音',
                color: '#FFB347',
                tools: []
            },
            {
                id: 'avatar',
                name: '数字人',
                icon: '👤',
                description: 'AI数字人和虚拟形象生成工具，打造专属虚拟助手',
                color: '#FFA07A',
                tools: []
            },
            {
                id: 'browser',
                name: '浏览器',
                icon: '🌐',
                description: 'AI增强的浏览器工具和插件，提升网页浏览体验',
                color: '#87CEEB',
                tools: []
            },
            {
                id: 'programming',
                name: '编程',
                icon: '💻',
                description: 'AI编程助手和代码生成工具，提升开发效率',
                color: '#98FB98',
                tools: []
            },
            {
                id: 'knowledge',
                name: '知识库',
                icon: '📚',
                description: 'AI知识管理和问答系统，构建智能知识库',
                color: '#DDA0DD',
                tools: []
            },
            {
                id: 'agent',
                name: 'Agent',
                icon: '🤖',
                description: 'AI智能体和自动化工具，让AI为你工作',
                color: '#F0E68C',
                tools: []
            }
        ];
        console.log('Fallback data loaded with 9 categories');
    }

    /**
     * Render categories grid
     */
    renderCategories() {
        if (!this.elements.categoriesGrid || !this.categories.length) {
            return;
        }

        const categoriesHTML = this.categories.map(category => {
            const toolCount = category.tools ? category.tools.length : 0;
            const recommendedCount = category.tools ? 
                category.tools.filter(tool => tool.recommended).length : 0;

            return `
                <div class="category-card fade-in-up" data-category-id="${category.id}">
                    <span class="category-icon">${category.icon}</span>
                    <h3 class="category-name">${category.name}</h3>
                    <p class="category-description">${category.description}</p>
                    <div class="category-count">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 6L9 17l-5-5"/>
                        </svg>
                        <span>${toolCount} 个工具</span>
                        ${recommendedCount > 0 ? `<span>·</span><span>${recommendedCount} 个推荐</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        this.elements.categoriesGrid.innerHTML = categoriesHTML;
        
        // Initialize filters after rendering
        this.initializeFilters();
    }

    /**
     * Initialize filters after categories are rendered
     */
    initializeFilters() {
        // This method can be used for any post-render initialization
        // Currently just triggers the animation setup
        this.addAnimations();
    }

    /**
     * Navigate to category page
     */
    navigateToCategory(categoryId) {
        // Add click animation
        const categoryCard = document.querySelector(`[data-category-id="${categoryId}"]`);
        if (categoryCard) {
            categoryCard.style.transform = 'scale(0.95)';
            setTimeout(() => {
                categoryCard.style.transform = '';
            }, 150);
        }

        // Navigate to category page with a slight delay for animation
        setTimeout(() => {
            window.location.href = `category.html?id=${categoryId}`;
        }, 200);
    }

    /**
     * Add entrance animations
     */
    addAnimations() {
        // Animate category cards with staggered delay
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 100}ms`;
        });

        // Animate hero stats
        const statItems = document.querySelectorAll('.stat-item');
        statItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            item.style.transition = 'all 0.6s ease-out';
            
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 800 + (index * 200));
        });

        // Animate feature cards
        const featureCards = document.querySelectorAll('.feature-card');
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                }
            });
        }, observerOptions);

        featureCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s ease-out';
            observer.observe(card);
        });
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
        // Create error toast
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

        // Add toast styles
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

        // Auto remove after 5 seconds
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
     * Handle window resize
     */
    handleResize() {
        // Adjust grid layout on mobile if needed
        const grid = this.elements.categoriesGrid;
        if (grid && window.innerWidth <= 768) {
            grid.style.gridTemplateColumns = '1fr';
        } else if (grid) {
            grid.style.gridTemplateColumns = '';
        }
    }

    /**
     * Get category by ID
     */
    getCategoryById(id) {
        return this.categories.find(category => category.id === id);
    }

    /**
     * Get all categories
     */
    getAllCategories() {
        return this.categories;
    }

    /**
     * Search categories
     */
    searchCategories(query) {
        const lowercaseQuery = query.toLowerCase();
        return this.categories.filter(category => 
            category.name.toLowerCase().includes(lowercaseQuery) ||
            category.description.toLowerCase().includes(lowercaseQuery) ||
            category.tools.some(tool => 
                tool.name.toLowerCase().includes(lowercaseQuery) ||
                tool.description.toLowerCase().includes(lowercaseQuery)
            )
        );
    }
}

// Utility functions
const Utils = {
    /**
     * Debounce function calls
     */
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

    /**
     * Check if device is mobile
     */
    isMobile() {
        return window.innerWidth <= 768;
    },

    /**
     * Smooth scroll to element
     */
    scrollToElement(element, offset = 0) {
        const elementPosition = element.offsetTop - offset;
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    },

    /**
     * Format number with commas
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    /**
     * Get URL parameters
     */
    getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    }
};

// Add CSS animations for toasts
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    .toast-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .toast-content svg {
        flex-shrink: 0;
    }
`;
document.head.appendChild(style);

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global app instance
    window.aiToolsMain = new AIToolsMain();
    
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
    module.exports = { AIToolsMain, Utils };
}