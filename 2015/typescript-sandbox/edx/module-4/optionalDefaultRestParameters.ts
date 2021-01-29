(function () {

    //Optional parameter
    function buildAddressOptional(address1: string, city: string, state: string, address2?: string) {
        var addr2: string = (address2.length > 0) ? ', ' +  address2 : '';
        displayAddress(address1 + addr2 + ', ' + city + ', ' + state);
    }

    //Rest parameters
    function buildAddressRest(city: string, state: string, ...Address: string[]) {
        var address = '';
        Address.forEach((addr) => address += (addr.length > 0) ? addr + ', ': '');
        address += city + ', ' + state;
        displayAddress(address);
    }

    function displayAddress(msg: string) {
        result.innerHTML = msg;
    }

    var $ = (id) => document.getElementById(id);

    var addressButton: HTMLButtonElement = <HTMLButtonElement>$('addressButton'),
        address: HTMLInputElement = <HTMLInputElement>$('address'),
        address2: HTMLInputElement = <HTMLInputElement>$('address2'),
        city: HTMLInputElement = <HTMLInputElement>$('city'),
        state: HTMLInputElement = <HTMLInputElement>$('state'),
        result = $('result');

    //Call function with optional parameter
    //addressButton.addEventListener('click',(e) => buildAddressOptional(address.value, city.value, address2.value));

    //Call function with Rest parameters
    addressButton.addEventListener('click',(e) => buildAddressRest(city.value, state.value, address.value));

} ());
