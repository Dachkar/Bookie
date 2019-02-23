const { ipcRenderer } = require('electron')

let $ = require('jquery')
let fs = require('fs')
var contacts = [];
let modal;
let vCard = require('vcf');

//Cancel button from addcontact html -- Closes addcontact modal.
$('#cancelbtn').on('click', () => {
  ipcRenderer.send('asynchronous-message', 'closeModal')
})

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
    if (contact.photo == null){
      $(".contactpic").empty();
      $('<img src="default.png" width="130px" height="130px">').appendTo($(".contactpic"));
    }
    else {
      $(".contactpic").empty();
      $('<p>Has custom Photo</p>').appendTo($(".contactpic"));
    }
    
    
    
    $('#selectedname').text(contact.name);
    $('#selectednumber').text(contact.number);
    $('#selectedcellphone').text(contact.cellphone);
    $('#selectedemail').text(contact.email);
    $('#selectedaddress').text(contact.address);
    $('#selectedbirthdate').text(contact.birthdate);
    $('#selectedcompany').text(contact.company);
    $('#selectedurl').text(contact.url);
    
    $('#editbtn').off('click');
    $('#editbtn').on('click', () => {
      editEntry(index);
    });


    $('#deletebtn').off('click');
    $('#deletebtn').on('click', () => {
      deleteEntry(index);
    })
}

function editEntry(index){
  ipcRenderer.send('asynchronous-message', 'showEditModal')
}

//Called by the delete button. 
function deleteEntry(index){

    contacts.splice(index, 1);
    fs.truncateSync('contacts.txt');

      
    contacts.forEach((contact, index) => {

      fs.appendFileSync('contacts.txt', contact.name+","+contact.number+'\n', (err) => {
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
    cards.forEach((card, index) => {
      fs.appendFileSync('contacts.txt', card.get("n")+","+card.get("tel")+'\n', (err) => {
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
    fs.appendFileSync("vcard.txt", card.toString(),(err) => {
      if (err) throw err;
      console.log("the data was exported!");
    });

  })
}
