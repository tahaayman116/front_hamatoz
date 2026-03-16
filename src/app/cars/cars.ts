import { Component, OnInit, HostListener } from '@angular/core';
import { NgForOf, NgIf, DecimalPipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Car {
  id: number;
  name: string;
  price: number;
  miles: number;
  transmission: string;
  location: string;
  image: string;
  isFavorited: boolean;
  badge?: string;
  brand: string;
  condition: string;
}

@Component({
  selector: 'app-cars',
  imports: [NgForOf, NgIf, FormsModule, DecimalPipe, UpperCasePipe],
  templateUrl: './cars.html',
  styleUrl: './cars.css',
})
export class Cars implements OnInit {
  // Mobile UI states
  showMobileFilters: boolean = false;
  isLargeScreen: boolean = window.innerWidth >= 1024;

  // Filter states
  brandSearch: string = '';
  selectedBrands: { [key: string]: boolean } = {};
  filteredBrands: string[] = [];
  minPricePercent: number = 0;
  maxPricePercent: number = 100;
  selectedCondition: string = '';
  
  // Cars data
  allCars: Car[] = [
    {
      id: 1,
      name: '2022 Ford Bronco',
      price: 45000,
      miles: 55000,
      transmission: 'Automatic',
      location: 'San Francisco, CA',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQL0ZTtMCajtk7ncId_LQmsgg2XGg5kxEZ2idvIgiJdbfCPn6xuvcx5qwS5r2nsLBuB4PTNwaWxYbwhHwVAJ6iH0XrV8v8pPvURF20qzaYnDYbdESNcAER98aKs9m9NHuhv2F1DVRfdz75bfy3c4E5U59yrW_tkPLg3Xf-EJbElAZuEMXOpbt1G-cCKM-ptdIZQCUIoEJgd7K0i4H66GHY87AY2ddRtu86UMs2-M8Zkt2kKrsDnKJVRzJBCmaRUr6ZF0lUdgBmHdW-',
      isFavorited: false,
      brand: 'Ford',
      condition: 'used'
    },
    {
      id: 2,
      name: '2021 Toyota RAV4',
      price: 32000,
      miles: 30000,
      transmission: 'Automatic',
      location: 'Los Angeles, CA',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbPZKrDAMZMXy74aSv1tqJd-mGIHt9a94Ijpjxkd_PG6b3gdh0tBA4F6skCr7q9jiGOi3R-CQECFdyWL4FgObGgZBNc39wwEXVurUa22HFjSne1Lv1aRFDpFEBpn-laAMuuCF-U8BNQZ7H5XI_aglEeqMwf5v3Xj6Xya0a1QbquPc0v2GgY7kh41S1us1bHTDcVesIsGFisx1gjz7AkHG6_qgEni1AS0UISl06y-xERCQKqLee8P-gUL8beX0_rugU1yvxO3vYT2Bv',
      isFavorited: false,
      brand: 'Toyota',
      condition: 'used'
    },
    {
      id: 3,
      name: '2023 Honda Civic',
      price: 28500,
      miles: 5000,
      transmission: 'Automatic',
      location: 'New York, NY',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAE0gJGRGll6bfWUgy2y7bcBY8nO_n3Gmmao269vsrYVFSwDHJ6_LSS7ELSds4b7-C7Pd_oIv3Pq_LsjxeDh1Yr8PYujLJaZqhTF4OQTW4G0cwkgBgOObHW2HAjNkR4xJIuKrF-4BFkqRHerS_WkLptOUtFF300NoJ8G2vly6jFOI-PjL9STM3C-cXr_Yv0zwYf7McK8OknrwBluyn_vl-aES8Fv2-5e1PPZZ1DOX85d9DU7h6be9R5tWQSoZcIGSBftL1BCLixzxKv',
      isFavorited: false,
      brand: 'Honda',
      condition: 'new'
    },
    {
      id: 4,
      name: '2020 BMW X5',
      price: 55000,
      miles: 40000,
      transmission: 'Automatic',
      location: 'Chicago, IL',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANteO2LsPO1ANUjU0Wcb8kueb4a6ODxv8ccL4CIELHJG_3lVplmdeuw8qaxsExI-o9yxHkGngKH6Qg3T6EqN38A4O700dVmmqaJ0Wlmv8Ph0qBqB0PVnORfyGmR_tWp1RTpKSFlYSUaWzyfJ2Ze5xTM0clzuAtogaAz1oB2aUoOb5WAmOJNsTk9EKeqjQ2jkBArKZepfFtO-hz-WFiesrVRDrB5hSSUUYNeKnZgzfEyYKBdDeFY7or7vw2KmlULwoS10iArRvz9IAb',
      isFavorited: false,
      brand: 'BMW',
      condition: 'used'
    },
    {
      id: 5,
      name: '2022 Tesla Model 3',
      price: 48000,
      miles: 15000,
      transmission: 'Automatic',
      location: 'Austin, TX',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvUmuaedY8yE6TEGnM993HHgdip2Zs8xtUce5NdCKqCDM2fZ6qaOngXn4CH5NfmKmQ_HStonnwuWzqmiOhMUvhWvV9zJflCNFvYiijKyz-9hM3MjOiOebc0AKjVxiNQDSfHESNP_3A8YnDimTHYloB4w3gaivDGt3fjAZ-fN3YQ79vALFwnW4SPC-2zrKPYLsMRGDO4Sz0QElMYpCfV0ifhD3l4cnNiqPRcq9QVXtPjmCDPiMnS4t7oWBYpWKTg-Xcdcbk8e6D0E1W',
      isFavorited: true,
      badge: 'Great Deal',
      brand: 'Tesla',
      condition: 'used'
    },
    {
      id: 6,
      name: '2019 Audi Q5',
      price: 41000,
      miles: 35000,
      transmission: 'Automatic',
      location: 'Miami, FL',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUHCVf6KBJXIz36ofHj_y75uI0ISaSp6O6te1n2KzvtiCJL36mu8yKaNopM0GeDd98s5XXgDX5lHM1TYXjyZMgdF4bofXCCzSRfhEsVXUlqYS3530midb79sPmq6sULoNhzxwhB_E5JChWxsH4ihmSv4UeoHDYHk6xguB_ysQyavwyGZo2Rz3qH1YyEsTNg1RtECTSDOXBGCXH6_OVuwzPAixXKlwQ63df81WPcmfdJn1PqpATLSNM2y_jJ4AbEzN9Rbq6mheF0_c4',
      isFavorited: false,
      brand: 'Audi',
      condition: 'used'
    }
  ];

  filteredCars: Car[] = [];
  totalCars: number = 1280;
  currentPage: number = 1;
  sortBy: string = 'Recommended';
  allBrands: string[] = ['Toyota', 'Ford', 'Honda', 'BMW', 'Tesla', 'Audi'];

  ngOnInit() {
    this.initializeBrands();
    this.filteredCars = [...this.allCars];
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isLargeScreen = window.innerWidth >= 1024;
    if (this.isLargeScreen) {
      this.showMobileFilters = false;
    }
  }

  toggleMobileFilters() {
    this.showMobileFilters = !this.showMobileFilters;
    // Prevent body scroll when mobile filters are open
    if (this.showMobileFilters && !this.isLargeScreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  initializeBrands() {
    this.filteredBrands = [...this.allBrands];
    this.allBrands.forEach(brand => {
      this.selectedBrands[brand] = false;
    });
  }

  filterBrands() {
    this.filteredBrands = this.allBrands.filter(brand =>
      brand.toLowerCase().includes(this.brandSearch.toLowerCase())
    );
  }

  applyFilters() {
    this.filteredCars = this.allCars.filter(car => {
      // Brand filter - تطبيق فقط إذا اختار المستخدم أنواع محددة
      const selectedBrandsList = Object.keys(this.selectedBrands).filter(brand => this.selectedBrands[brand]);
      if (selectedBrandsList.length > 0 && !selectedBrandsList.includes(car.brand)) {
        return false;
      }

      // Price filter - تطبيق النطاق السعري
      const minPrice = (this.minPricePercent / 100) * 100000;
      const maxPrice = (this.maxPricePercent / 100) * 100000;
      if (car.price < minPrice || car.price > maxPrice) {
        return false;
      }

      // Condition filter - تطبيق فقط إذا اختار المستخدم حالة محددة
      if (this.selectedCondition && this.selectedCondition !== '' && car.condition !== this.selectedCondition) {
        return false;
      }

      return true;
    });
    
    // إرجاع إلى الصفحة الأولى بعد التصفية
    this.currentPage = 1;
  }

  resetFilters() {
    this.brandSearch = '';
    this.selectedBrands = {};
    this.selectedCondition = '';
    this.minPricePercent = 0;
    this.maxPricePercent = 100;
    this.filteredBrands = [...this.allBrands];
    this.allBrands.forEach(brand => {
      this.selectedBrands[brand] = false;
    });
    this.filteredCars = [...this.allCars];
    this.currentPage = 1;
  }

  toggleFavorite(carId: number) {
    const car = this.filteredCars.find(c => c.id === carId);
    if (car) {
      car.isFavorited = !car.isFavorited;
    }
    const originalCar = this.allCars.find(c => c.id === carId);
    if (originalCar) {
      originalCar.isFavorited = !originalCar.isFavorited;
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < 12) {
      this.currentPage++;
    }
  }
}
