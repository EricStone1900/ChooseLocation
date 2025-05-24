class LocationSelector {
    constructor() {
        this.locationData = [];
        this.selectedProvince = null;
        this.selectedCity = null;
        this.selectedDistrict = null;
        this.currentLevel = 1;
        
        this.initializeElements();
        this.bindEvents();
        this.loadLocationData();
    }

    initializeElements() {
        this.modal = document.getElementById('locationModal');
        this.openBtn = document.getElementById('openSelector');
        this.closeBtn = document.getElementById('closeModal');
        this.confirmBtn = document.getElementById('confirmBtn');
        this.selectedLocationDiv = document.getElementById('selectedLocation');
        
        this.provinceBtn = document.getElementById('provinceBtn');
        this.cityBtn = document.getElementById('cityBtn');
        this.districtBtn = document.getElementById('districtBtn');
        
        this.provinceList = document.getElementById('provinceList');
        this.cityList = document.getElementById('cityList');
        this.districtList = document.getElementById('districtList');
    }

    bindEvents() {
        this.openBtn.addEventListener('click', () => this.openModal());
        this.closeBtn.addEventListener('click', () => this.closeModal());
        this.confirmBtn.addEventListener('click', () => this.confirmSelection());
        
        this.modal.querySelector('.modal-overlay').addEventListener('click', () => this.closeModal());
        
        this.provinceBtn.addEventListener('click', () => this.showLevel(1));
        this.cityBtn.addEventListener('click', () => this.showLevel(2));
        this.districtBtn.addEventListener('click', () => this.showLevel(3));
        
        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('show')) {
                this.closeModal();
            }
        });
    }

    async loadLocationData() {
        try {
            const response = await fetch('./ChooseLocation/ChooseLocation/Cities.json');
            this.locationData = await response.json();
            this.renderProvinces();
        } catch (error) {
            console.error('Failed to load location data:', error);
            this.showError('Failed to load location data');
        }
    }

    showError(message) {
        this.provinceList.innerHTML = `<div class="error">${message}</div>`;
    }

    openModal() {
        this.modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        this.resetSelection();
    }

    closeModal() {
        this.modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    resetSelection() {
        this.selectedProvince = null;
        this.selectedCity = null;
        this.selectedDistrict = null;
        this.currentLevel = 1;
        
        this.cityBtn.style.display = 'none';
        this.districtBtn.style.display = 'none';
        
        this.updateBreadcrumb();
        this.showLevel(1);
        this.updateConfirmButton();
    }

    renderProvinces() {
        const provinces = this.locationData.filter(item => item.level === 1);
        this.renderLocationList(this.provinceList, provinces, (province) => {
            this.selectedProvince = province;
            this.selectedCity = null;
            this.selectedDistrict = null;
            
            this.cityBtn.textContent = 'City';
            this.cityBtn.style.display = 'inline-block';
            this.districtBtn.style.display = 'none';
            
            this.renderCities();
            this.showLevel(2);
            this.updateConfirmButton();
        });
    }

    renderCities() {
        if (!this.selectedProvince) return;
        
        const cities = this.locationData.filter(item => 
            item.level === 2 && item.sheng === this.selectedProvince.sheng
        );
        
        this.renderLocationList(this.cityList, cities, (city) => {
            this.selectedCity = city;
            this.selectedDistrict = null;
            
            this.districtBtn.textContent = 'District';
            this.districtBtn.style.display = 'inline-block';
            
            this.renderDistricts();
            this.showLevel(3);
            this.updateConfirmButton();
        });
    }

    renderDistricts() {
        if (!this.selectedCity) return;
        
        const districts = this.locationData.filter(item => 
            item.level === 3 && 
            item.sheng === this.selectedCity.sheng && 
            item.di === this.selectedCity.di
        );
        
        this.renderLocationList(this.districtList, districts, (district) => {
            this.selectedDistrict = district;
            this.updateConfirmButton();
        });
    }

    renderLocationList(container, items, onSelect) {
        if (items.length === 0) {
            container.innerHTML = '<div class="loading">No items found</div>';
            return;
        }

        const html = items.map(item => 
            `<div class="location-item" data-code="${item.code}">
                ${item.name}
            </div>`
        ).join('');
        
        container.innerHTML = html;
        
        // Add click handlers
        container.querySelectorAll('.location-item').forEach(element => {
            element.addEventListener('click', () => {
                // Remove previous selection
                container.querySelectorAll('.location-item').forEach(el => 
                    el.classList.remove('selected')
                );
                
                // Add selection to clicked item
                element.classList.add('selected');
                
                // Find the selected item data
                const code = element.dataset.code;
                const selectedItem = items.find(item => item.code === code);
                
                if (selectedItem && onSelect) {
                    onSelect(selectedItem);
                }
            });
        });
    }

    showLevel(level) {
        this.currentLevel = level;
        
        // Update breadcrumb
        this.updateBreadcrumb();
        
        // Show appropriate list
        this.provinceList.classList.remove('active', 'prev');
        this.cityList.classList.remove('active', 'prev');
        this.districtList.classList.remove('active', 'prev');
        
        switch(level) {
            case 1:
                this.provinceList.classList.add('active');
                this.cityList.classList.add('prev');
                this.districtList.classList.add('prev');
                break;
            case 2:
                this.provinceList.classList.add('prev');
                this.cityList.classList.add('active');
                this.districtList.classList.add('prev');
                break;
            case 3:
                this.provinceList.classList.add('prev');
                this.cityList.classList.add('prev');
                this.districtList.classList.add('active');
                break;
        }
    }

    updateBreadcrumb() {
        // Update breadcrumb buttons
        this.provinceBtn.classList.remove('active');
        this.cityBtn.classList.remove('active');
        this.districtBtn.classList.remove('active');
        
        // Update button text
        if (this.selectedProvince) {
            this.provinceBtn.textContent = this.selectedProvince.name;
        }
        if (this.selectedCity) {
            this.cityBtn.textContent = this.selectedCity.name;
        }
        if (this.selectedDistrict) {
            this.districtBtn.textContent = this.selectedDistrict.name;
        }
        
        // Set active button
        switch(this.currentLevel) {
            case 1:
                this.provinceBtn.classList.add('active');
                break;
            case 2:
                this.cityBtn.classList.add('active');
                break;
            case 3:
                this.districtBtn.classList.add('active');
                break;
        }
    }

    updateConfirmButton() {
        const hasValidSelection = this.selectedProvince && this.selectedCity;
        this.confirmBtn.disabled = !hasValidSelection;
        
        if (hasValidSelection) {
            let text = 'Confirm';
            if (this.selectedDistrict) {
                text += ` (${this.selectedProvince.name} > ${this.selectedCity.name} > ${this.selectedDistrict.name})`;
            } else {
                text += ` (${this.selectedProvince.name} > ${this.selectedCity.name})`;
            }
            this.confirmBtn.textContent = text.length > 50 ? 'Confirm Selection' : text;
        } else {
            this.confirmBtn.textContent = 'Confirm Selection';
        }
    }

    confirmSelection() {
        if (!this.selectedProvince || !this.selectedCity) {
            return;
        }
        
        let locationText = `${this.selectedProvince.name} > ${this.selectedCity.name}`;
        if (this.selectedDistrict) {
            locationText += ` > ${this.selectedDistrict.name}`;
        }
        
        this.selectedLocationDiv.textContent = locationText;
        this.selectedLocationDiv.classList.add('has-selection');
        
        this.closeModal();
        
        // Show success animation
        this.selectedLocationDiv.style.transform = 'scale(1.05)';
        setTimeout(() => {
            this.selectedLocationDiv.style.transform = 'scale(1)';
        }, 200);
    }
}

// Initialize the location selector when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new LocationSelector();
});

// Add some demo functionality
document.addEventListener('DOMContentLoaded', () => {
    // Add a simple demo counter
    let visitCount = localStorage.getItem('visitCount') || 0;
    visitCount++;
    localStorage.setItem('visitCount', visitCount);
    
    // Add visit counter to footer
    const footer = document.createElement('footer');
    footer.style.cssText = `
        text-align: center;
        padding: 20px;
        color: white;
        opacity: 0.8;
        font-size: 0.9rem;
    `;
    footer.innerHTML = `
        <p>Visit count: ${visitCount} | Built with ❤️ for location selection demo</p>
        <p>Based on JD.com's address selection pattern</p>
    `;
    document.body.appendChild(footer);
});