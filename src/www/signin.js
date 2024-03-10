const yieldLoadingCard = document.getElementById('yieldLoadingCard'),

      phoneNumberCard = document.getElementById('phoneNumberCard')
      phoneNumberForm = document.getElementById('phoneNumberForm'),
      phoneNumber = document.getElementById('phoneNumber'),
      phoneNextButton = document.getElementById('phoneNextButton'),

      smsConfirmCard = document.getElementById('smsConfirmCard'),
      smsSendTo = document.getElementById('smsSendTo'),
      smsCodeForm = document.getElementById('smsCodeForm'),
      smsCode = document.getElementById('smsCode'),
      smsNextButton = document.getElementById('smsNextButton'),

      passwordCard = document.getElementById('passwordCard'),
      passwordForm = document.getElementById('passwordForm'),
      password = document.getElementById('password'),
      passwordNextButton = document.getElementById('passwordNextButton')

window.addEventListener('get-phone-number', (event) => {
  yieldLoadingCard.classList.add('d-none')
  smsConfirmCard.classList.add('d-none')
  passwordCard.classList.add('d-none')    
  phoneNumberCard.classList.remove('d-none')
})
phoneNextButton.addEventListener('click', (e) => {
  if (new RegExp(/^(\+\d{1,3})?\d{10}$/).test(phoneNumber.value)) {
    window.ipc.sendPhoneNumber(phoneNumber.value)        
  } else {
    phoneNumberForm.classList.add('is-invalid')
    phoneNumber.classList.add('is-invalid')
  }  
})

window.addEventListener('get-sms-confirm', (event) => {
  phoneNumberCard.classList.add('d-none')
  passwordCard.classList.add('d-none')
  smsSendTo.innerText = phoneNumber.value
  smsConfirmCard.classList.remove('d-none')
})
smsNextButton.addEventListener('click', (e) => {
  if (smsCode.value.length !== 0) {
    window.ipc.sendSmsConfirm(smsCode.value)        
  } else {
    smsCodeForm.classList.add('is-invalid')
    smsCode.classList.add('is-invalid')
  }   
})

window.addEventListener('get-2fa-pass', (event) => {
  phoneNumberCard.classList.add('d-none')
  smsConfirmCard.classList.add('d-none')
  passwordCard.classList.remove('d-none')
})
passwordNextButton.addEventListener('click', (e) => {
  if (password.value.length !== 0) {
    window.ipc.send2FAPass(password.value)        
  } else {
    passwordForm.classList.add('is-invalid')
    password.classList.add('is-invalid')
  }   
})

document.addEventListener('keypress', (e) => {
  if (e.keyCode === 13) {
    e.preventDefault()
    document.querySelector('.card-body:not(.d-none)')
            .querySelector('button').click()
  }
});