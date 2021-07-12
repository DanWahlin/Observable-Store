export class Customer {
    id: number = 0;
    name = '';
    address: Address = {
        street:'',
        city: '',
        state: '',
        zip: '',
    };
}

export class Address {
    street = '';
    city = '';
    state = '';
    zip = '';
}