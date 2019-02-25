const { ipcRenderer } = require('electron');
const jquery_validation = require('jquery-validation');
const jquery_val_extra = require("jquery-validation/dist/additional-methods.js");

let $ = require('jquery')
let fs = require('fs')
var contacts = [];
let modal;
let vCard = require('vcf');
var selectedContacts = {};



$.extend($.validator.messages, { required: "Name is required",phoneUS: "Please insert a valid US number", url: " Please insert a valid URL(Must start with https://)"});

//Cancel button from addcontact html -- Closes addcontact modal.
$('#cancelbtn').on('click', () => {
  ipcRenderer.send('asynchronous-message', 'closeModal')
})

$(document).ready(function() {

  $('#addform').validate({ // initialize the plugin
      rules: {
        contactname: {
              required: true
          },
        contactnumber: {
            phoneUS: true
          },
          contactcellphone: {
            phoneUS: true
          },
          contactemail: {
            email: true
          },
          contacturl: {
            url: true
          },
          contactphoto: {
           extension: "jpg|png|gif|jpeg|bmp"
          }
      },
      submitHandler: function(form) { // for demo
                  
          let name = $('#contactname').val()
          let number = $('#contactnumber').val()
          let cellphone = $('#contactcellphone').val()
          let email = $('#contactemail').val()
          let address = $('#contactaddress').val()
          let birthdate = $('#contactbirthdate').val()
          let company = $('#contactcompany').val()
          let url = $('#contacturl').val()
          let photo = $('#contactphoto').val()

          if (number != "" && number.length == 10){
            number = '('+ number.slice(0, 3)+ ')' + " " + number.slice(3,6) + " - " + number.slice(6,10);
          }
          if (number != "" && number.length == 12){
            number = '('+ number.slice(0, 3)+ ')' + " " + number.slice(4,7) + " - " + number.slice(8,12);
          }

          if (cellphone != "" && cellphone.length == 10){
            cellphone = '('+ cellphone.slice(0, 3)+ ')' + " " + cellphone.slice(3,6) + " - " + cellphone.slice(6,10);
          }
          if (cellphone != "" && cellphone.length == 12){
            cellphone = '('+ cellphone.slice(0, 3)+ ')' + " " + cellphone.slice(4,7) + " - " + cellphone.slice(8,12);
          }

          fs.appendFileSync('contacts.txt', name+","+number+","+cellphone+","+email+","+address+","+birthdate+","+company+","+url+","+photo+'\n', (err) => {
            if (err) throw err;
            console.log("the data was appended!");
          });

          ipcRenderer.send('asynchronous-message', 'closeAndRefresh')

      }
  });
  
});

//Add button from addcontact html -- Puts form field in contacts.txt file
$('#addbtn').on('click', () => {

  let name = $('#contactname').val()
  let number = $('#contactnumber').val()
  let cellphone = $('#contactcellphone').val()
  let email = $('#contactemail').val()
  let address = $('#contactaddress').val()
  let birthdate = $('#contactbirthdate').val()
  let company = $('#contactcompany').val()
  let url = $('#contacturl').val()
  let photo = $('#contactphoto').val()



  fs.appendFileSync('contacts.txt', name+","+number+","+cellphone+","+email+","+address+","+birthdate+","+company+","+url+","+photo+'\n', (err) => {
    if (err) throw err;
    console.log("the data was appended!");
  });

  ipcRenderer.send('asynchronous-message', 'closeAndRefresh')

})

//Called by loadAndDisplayContacts -- Places entries in a contact and add contact to contacts
//Then, creates html element for that contact and appends it to main contactlist element
function addEntry(name, number, cellphone, email, address, birthdate, company, url, photo){
  var contact = {};
  contact['name'] = name;
  contact['number'] = number;
  contact['cellphone'] = cellphone;
  contact['email'] = email;
  contact['address'] = address;
  contact['birthdate'] = birthdate;
  contact['company'] = company;
  contact['url'] = url;
  contact['photo'] = photo;

 
  contacts.push(contact);
  var index = contacts.length-1;

  let updateString = "<tr onclick='loadDetails(" + index + ")'><td>" + name + "</td><td>" + number + "</td></tr>"

  $('#contactlist').append(updateString)
  
}

//Called when you click on a contact on the contactlist html. Displays detailed information on the right
//Also handles Edit and Delete button
function loadDetails(index){
    var contact = contacts[index];

    //Check if user has picture set
    if (contact.photo == null || contact.photo == ""){
      $(".contactpic").empty();
      $('<img src="default.png" width="130px" height="130px">').appendTo($(".contactpic"));
    }
    else {
      $(".contactpic").empty();
      $('<p>Custom photo could not load.</p>').appendTo($(".contactpic"));
    }
    
    
    
    $('#selectedname').text(contact.name);
    $('#selectednumber').text(contact.number);
    $('#selectedcellphone').text(contact.cellphone);
    $('#selectedemail').text(contact.email);
    $('#selectedaddress').text(contact.address);
    $('#selectedbirthdate').text(contact.birthdate);
    $('#selectedcompany').text(contact.company);
    $('#selectedurl').html('<a target="_blank" href="'+contact.url+'">'+contact.url+' </a>');
    
    $('#editbtn').off('click');
    $('#editbtn').on('click', () => {
    editEntry(contact);
    });

    $('#deletebtn').off('click');
    $('#deletebtn').on('click', () => {
      deleteEntry(index);
    })
}


function editEntry(contact){
  ipcRenderer.send('showEditModal', contact)
}

//Called by the delete button. 
function deleteEntry(index){

    contacts.splice(index, 1);
    fs.truncateSync('contacts.txt');

      
    contacts.forEach((contact, index) => {

  fs.appendFileSync('contacts.txt', contact.name+","+contact.number+","+contact.cellphone+","+contact.email+","+contact.address+","+contact.birthdate+","+contact.company+","+contact.url+","+contact.photo+'\n', (err) => {
        if (err) throw err;
        console.log("the data was appended!");
      });
    })

    contacts = [];
    loadAndDisplayContacts();

}

//Goes through contacts in text file and calls addEntry function to place them in the html
function loadAndDisplayContacts() {
   let filename = "contacts.txt";

   //Check if file exists
   if(fs.existsSync(filename)) {
      let data = fs.readFileSync(filename, 'utf8').split('\n')
      $('#contactlist').html("<tr><th>Name</th><th>Phone</th></tr>");
      data.forEach((contact, index) => {
         let [ name, number, cellphone, email, address, birthdate, company, url, photo ] = contact.split(',')
         if (name){
           addEntry(name, number, cellphone, email, address, birthdate, company, url, photo)
         }
      })
      if (contacts.length > 0){
        loadDetails(0);
      }
   }
}

function showAddContactModal(){
  ipcRenderer.send('asynchronous-message', 'showModal')
}

function importFile(filename){
    let data = fs.readFileSync(filename, 'utf8');
    var cards = vCard.parse(data);

    var name = ''
    var tel = ''
    var cell = ''
    var email = ''
    var adr = ''
    var bday = ''
    var org = ''
    var url = ''
    var photo = ''

    cards.forEach((card, index) => {

       name = card.get("n");
       tel = card.get("tel");
       cell = card.get("cell");
       email = card.get("email");
       adr = card.get("adr");
       bday = card.get("bday");
       org = card.get("org");
       url = card.get("url");
       photo = card.get("photo");

      
      fs.appendFileSync('contacts.txt', name+","+tel+","+cell+","+email+","+adr+","+bday+","+org+","+url+","+photo+'\n', (err) => {
        if (err) throw err;
        console.log("the data was appended!");
      });

    });
    contacts = [];
    loadAndDisplayContacts();
}

function dropImport (f){
  var path = f.path;
  let data = fs.readFileSync(path, 'utf8');
  var cards = vCard.parse(data);

    var name = ''
    var tel = ''
    var cell = ''
    var email = ''
    var adr = ''
    var bday = ''
    var org = ''
    var url = ''
    var photo = ''

  cards.forEach((card, index) => {

      name = card.get("n");
      tel = card.get("tel");
      cell = card.get("cell");
      email = card.get("email");
      adr = card.get("adr");
      bday = card.get("bday");
      org = card.get("org");
      url = card.get("url");
      photo = card.get("photo");

      fs.appendFileSync('contacts.txt', name+","+tel+","+cell+","+email+","+adr+","+bday+","+org+","+url+","+photo+'\n', (err) => {
      if (err) throw err;
      console.log("the data was appended!");
    });

  });
  contacts = [];
  loadAndDisplayContacts();
}

function exportFile(){
    contacts.forEach((contact, index) => {
    console.log('exporting contact '+contact.name);
    card = new vCard();
    card.set("n", contact.name);
    card.set("tel", contact.number);
    card.set("cell", contact.cellphone);
    card.set("email", contact.email);
    card.set("adr", contact.address);
    card.set("bday", contact.birthdate);
    card.set("org", contact.company);
    card.set("url", contact.url);
    card.set("photo", contact.photo);

    fs.appendFileSync("vcard.vcf", card.toString() + '\n',(err) => {
      if (err) throw err;
      console.log("the data was exported!");
    });

  })
}
