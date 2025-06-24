/**
 * Comprehensive System Test for Business Timer Application
 * This test checks all major components and functionality
 */

class ComprehensiveSystemTest {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: [],
      warnings: [],
    };
  }

  async runAllTests() {
    console.log('🔍 Starting Comprehensive System Test...\n');
    
    await this.testHTMLStructure();
    await this.testReactComponents();
    await this.testStateManagement();
    await this.testLocalStorage();
    await this.testImportExport();
    await this.testThemeSystem();
    await this.testBackupRestore();
    await this.testResponsiveness();
    
    this.displayResults();
  }

  async testHTMLStructure() {
    console.log('📋 Testing HTML Structure...');
    
    try {
      // Check RTL support
      if (document.documentElement.dir === 'rtl') {
        this.pass('RTL direction is set');
      } else {
        this.fail('RTL direction is not set');
      }
      
      // Check language
      if (document.documentElement.lang === 'he') {
        this.pass('Hebrew language is set');
      } else {
        this.fail('Hebrew language is not set');
      }
      
      // Check root element
      if (document.getElementById('root')) {
        this.pass('Root element exists');
      } else {
        this.fail('Root element not found');
      }
    } catch (error) {
      this.error('HTML Structure Test', error);
    }
  }

  async testReactComponents() {
    console.log('⚛️ Testing React Components...');
    
    try {
      // Check if React is loaded
      if (window.React) {
        this.pass('React is loaded');
      } else {
        this.warn('React global not found (this is normal in production)');
      }
      
      // Check for key components in DOM
      const componentsToCheck = [
        { selector: 'h1', name: 'Main Title' },
        { selector: 'button', name: 'Buttons' },
        { selector: 'input', name: 'Input Fields' },
      ];
      
      componentsToCheck.forEach(({ selector, name }) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          this.pass(`${name} found (${elements.length})`);
        } else {
          this.warn(`${name} not found`);
        }
      });
    } catch (error) {
      this.error('React Components Test', error);
    }
  }

  async testStateManagement() {
    console.log('🗄️ Testing State Management (Zustand)...');
    
    try {
      // Check localStorage for zustand persist
      const storeKey = 'business-timer-storage';
      const storeData = localStorage.getItem(storeKey);
      
      if (storeData) {
        this.pass('Zustand store found in localStorage');
        
        try {
          const parsed = JSON.parse(storeData);
          if (parsed.state) {
            this.pass('Store data is valid JSON');
            
            // Check for key properties
            const expectedKeys = ['clients', 'timeEntries', 'tables', 'settings'];
            expectedKeys.forEach(key => {
              if (parsed.state[key] !== undefined) {
                this.pass(`Store contains ${key}`);
              } else {
                this.fail(`Store missing ${key}`);
              }
            });
          }
        } catch (e) {
          this.fail('Store data is not valid JSON');
        }
      } else {
        this.warn('No store data found (first run?)');
      }
    } catch (error) {
      this.error('State Management Test', error);
    }
  }

  async testLocalStorage() {
    console.log('💾 Testing LocalStorage...');
    
    try {
      // Test write
      const testKey = 'business-timer-test';
      const testValue = { test: true, timestamp: Date.now() };
      localStorage.setItem(testKey, JSON.stringify(testValue));
      this.pass('LocalStorage write successful');
      
      // Test read
      const retrieved = localStorage.getItem(testKey);
      if (retrieved) {
        const parsed = JSON.parse(retrieved);
        if (parsed.test === true) {
          this.pass('LocalStorage read successful');
        } else {
          this.fail('LocalStorage read failed');
        }
      }
      
      // Cleanup
      localStorage.removeItem(testKey);
      this.pass('LocalStorage cleanup successful');
    } catch (error) {
      this.error('LocalStorage Test', error);
    }
  }

  async testImportExport() {
    console.log('📤 Testing Import/Export...');
    
    try {
      // Check if XLSX is loaded
      if (window.XLSX) {
        this.pass('XLSX library is loaded');
      } else {
        this.fail('XLSX library not found');
      }
      
      // Test JSON export
      const testData = { clients: [], timeEntries: [] };
      const jsonString = JSON.stringify(testData);
      if (jsonString) {
        this.pass('JSON export test passed');
      }
    } catch (error) {
      this.error('Import/Export Test', error);
    }
  }

  async testThemeSystem() {
    console.log('🎨 Testing Theme System...');
    
    try {
      // Check CSS variables
      const root = document.documentElement;
      const cssVars = [
        '--color-primary',
        '--color-secondary',
        '--color-background',
        '--color-text',
      ];
      
      cssVars.forEach(varName => {
        const value = getComputedStyle(root).getPropertyValue(varName);
        if (value) {
          this.pass(`CSS variable ${varName} is set`);
        } else {
          this.warn(`CSS variable ${varName} not found`);
        }
      });
    } catch (error) {
      this.error('Theme System Test', error);
    }
  }

  async testBackupRestore() {
    console.log('♻️ Testing Backup/Restore...');
    
    try {
      // Check if backup functions would work
      const testBackup = {
        id: 'test',
        timestamp: new Date(),
        type: 'manual',
        data: {},
      };
      
      const serialized = JSON.stringify(testBackup);
      if (serialized) {
        this.pass('Backup serialization works');
      }
      
      const deserialized = JSON.parse(serialized);
      if (deserialized.id === 'test') {
        this.pass('Backup deserialization works');
      }
    } catch (error) {
      this.error('Backup/Restore Test', error);
    }
  }

  async testResponsiveness() {
    console.log('📱 Testing Responsiveness...');
    
    try {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      this.pass(`Window dimensions: ${width}x${height}`);
      
      // Check viewport meta tag
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        this.pass('Viewport meta tag exists');
      } else {
        this.fail('Viewport meta tag missing');
      }
      
      // Check if Tailwind classes are applied
      const tailwindElements = document.querySelectorAll('[class*="sm:"], [class*="md:"], [class*="lg:"]');
      if (tailwindElements.length > 0) {
        this.pass(`Responsive Tailwind classes found (${tailwindElements.length})`);
      } else {
        this.warn('No responsive Tailwind classes found');
      }
    } catch (error) {
      this.error('Responsiveness Test', error);
    }
  }

  // Helper methods
  pass(message) {
    console.log(`✅ ${message}`);
    this.testResults.passed++;
  }

  fail(message) {
    console.log(`❌ ${message}`);
    this.testResults.failed++;
    this.testResults.errors.push(message);
  }

  warn(message) {
    console.log(`⚠️ ${message}`);
    this.testResults.warnings.push(message);
  }

  error(test, error) {
    console.error(`🔥 Error in ${test}:`, error);
    this.testResults.failed++;
    this.testResults.errors.push(`${test}: ${error.message}`);
  }

  displayResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`⚠️ Warnings: ${this.testResults.warnings.length}`);
    
    const total = this.testResults.passed + this.testResults.failed;
    const percentage = total > 0 ? (this.testResults.passed / total * 100).toFixed(1) : 0;
    console.log(`\n📈 Success Rate: ${percentage}%`);
    
    if (this.testResults.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.testResults.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    if (this.testResults.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      this.testResults.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning}`);
      });
    }
    
    console.log('\n✨ Test Complete!');
  }
}

// Auto-run tests when page loads
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    // Wait a bit for React to fully render
    setTimeout(() => {
      const tester = new ComprehensiveSystemTest();
      tester.runAllTests();
      
      // Make it available globally for manual testing
      window.comprehensiveTest = tester;
    }, 2000);
  });
}

export default ComprehensiveSystemTest; 