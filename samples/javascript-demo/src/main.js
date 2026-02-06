import CustomersStore from './customers-store.js';

const customersStore = new CustomersStore();
customersStore.getCustomers().then((customers) => {
    // Get customers via fetch
    console.log('Fetch returned ' + customers.length + ' customers');
    document.body.innerHTML += '<p>Fetch returned ' + customers.length + ' customers</p>';
    // Get customers from store
    customersStore.getCustomers().then((customers) => {
        console.log('Store returned ' + customers.length + ' customers');
        document.body.innerHTML += '<p>Store returned ' + customers.length + ' customers</p>';
    });
});
