document.addEventListener('DOMContentLoaded', function() {
    const preferencesForm = document.getElementById('preferencesForm');
    const domainsContainer = document.getElementById('domainsContainer');
    const addDomainBtn = document.getElementById('addDomainBtn');
    const messageElement = document.getElementById('message');

    let domainCount = 0;

    function addDomainInput(domain = '', index = domainCount + 1) {
        domainCount++;

        const domainInput = document.createElement('div');
        domainInput.classList.add('relative', 'mb-4');

        domainInput.innerHTML = `
            <label for="domain${index}" class="block font-medium">Domain ${index}</label>
            <div class="flex gap-1 border items-center justify-center p-2 mt-1">
                <input 
                    type="text" 
                    id="domain${index}" 
                    name="domain${index}" 
                    class="form-input w-full mt-1 outline-none" 
                    placeholder="Enter domain name"
                    value="${domain}"
                >
                <button 
                    type="button" 
                    class="bg-red-500 border text-white px-2 py-1 font-bold rounded hover:bg-red-600" data-index="${index}"
                >
                    X
                </button>
            </div>
        `;
        
        domainsContainer.appendChild(domainInput);

        const deleteBtn = domainInput.querySelector('button');
        deleteBtn.addEventListener('click', () => {
            domainInput.remove();
            domainCount--;
            updateDomainIndices();
        });
    }

    function updateDomainIndices() {
        const domainInputs = domainsContainer.querySelectorAll('.relative');
        domainInputs.forEach((domainInput, index) => {
            const newIndex = index + 1;
            const label = domainInput.querySelector('label');
            const input = domainInput.querySelector('input');
            const deleteBtn = domainInput.querySelector('button');

            label.textContent = `Domain ${newIndex}`;
            label.setAttribute('for', `domain${newIndex}`);
            input.setAttribute('id', `domain${newIndex}`);
            input.setAttribute('name', `domain${newIndex}`);
            deleteBtn.setAttribute('data-index', newIndex);
        });
    }

    addDomainBtn.addEventListener('click', () => {
        addDomainInput();
    });

    preferencesForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const preferredOrder = {};

        for (let i = 1; i <= domainCount; i++) {
            const domainName = document.getElementById(`domain${i}`).value.trim();

            if (domainName) {
                preferredOrder[domainName] = i;
            }
        }

        savePreferredOrder(preferredOrder);

        messageElement.textContent = 'Preferences saved successfully!';
    });

    const savePreferredOrder = (preferredOrder) => {
        chrome.storage.local.set({ preferredOrder }, () => {
            if (chrome.runtime.lastError) {
                console.error('Error saving preferred order:', chrome.runtime.lastError);
            } else {
                console.log('Preferred order saved:', preferredOrder);
            }
        });
    }

    const loadPreferences = () => {
        chrome.storage.local.get(['preferredOrder'], (result) => {
            const preferredOrder = result.preferredOrder || {};

            const sortedPreferences = Object.entries(preferredOrder)
                .sort((a, b) => a[1] - b[1]);

            if (sortedPreferences.length > 0) {
                sortedPreferences.forEach(([domain, index]) => {
                    addDomainInput(domain, index);
                });
                domainCount = sortedPreferences.length;
            } else {
                addDomainInput();
            }
        });
    }

    loadPreferences();
});
