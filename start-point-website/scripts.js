// const API_URL = 'https://harri.is/empowerWealth/callapi.php?phonenumber=';
const API_URL = 'callapi.php?';

const program = (() => {
  const results = document.querySelector('.results');
  // Clear results div
  function clearResults() {
    while (results.firstChild) {
      results.firstChild.remove();
    }
  }
  // Show loading gif and text
  function loading() {

    const element = document.createElement('div');
    element.classList.add('loading');

    const img = document.createElement('img');
    img.setAttribute('src', 'loading.gif');
    element.appendChild(img);

    const p = document.createElement('p');
    p.appendChild(document.createTextNode('Making phone call...'));
    element.appendChild(p);

    results.appendChild(element);
  }

  // Confirms input is not empty or only spaces
  function validNumber(value) {
    return value.length > 0 && !value.replace(/\s/g, '').length !== 0;
  }

  // Confirms input does not contain any spaces
  function validName(value) {
    return !value.includes(" ");
  }

  // Display text below input
  function display(input) {
    // Clear results div first
    while (results.firstChild) {
      results.removeChild(results.firstChild);
    }
    results.appendChild(document.createTextNode(input));
  }

  var request = new XMLHttpRequest();
  // Make GET request to callapi.php
  function fetchData(number, name, ewid) {
    fetch(`${API_URL}phonenumber=${number}&name=${name}&ewid=${ewid}`, {
      credentials: 'same-origin'
    })
      .then((response) => {
        if (response.ok) {
          return number;
        }
        throw new Error('Error, please retry or contact system administrator');
      })
      .then((data) => {
        display('Call made to ' + data);
      })
      .catch((error) => {
        display('Error contacting Empower Wealth server, please contact system administrator');
      });
  }

  // Retrieve data from fields once submit is pressed
  function onSubmit(e) {
    e.preventDefault();

    const phoneInput = e.target.querySelector('#phone-number');
    const nameInput = e.target.querySelector('#name');
    const ewidInput = e.target.querySelector('#ewid');
    // Make sure no input is empty
    if (validNumber(phoneInput.value) && validName(nameInput.value) && validNumber(ewidInput.value)) {
      while (results.firstChild) {
        results.removeChild(results.firstChild);
      }
      loading();
      fetchData(phoneInput.value, nameInput.value, ewidInput.value);
    } else {
      const p = document.createElement('p');
      p.appendChild(document.createTextNode('Input is invalid'));
      results.appendChild(p);
    }
  }

  function init(_domains) {
    const domains = _domains;

    const form = domains.querySelector('form');
    form.addEventListener('submit', onSubmit);
  }

  return {
    init,
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  const domains = document.querySelector('.domains');
  program.init(domains);
});
