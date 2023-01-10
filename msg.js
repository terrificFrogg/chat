var socket = io();

function typing(){
    
}

function notTyping(){

}

function getMessages(){
    $.get('/messages', (res)=>{
        res.forEach(element => {
            if(document.getElementById(element.chatId) === null){
                $('#msgs').append(`
                    <div class='message-box border border-dark-subtle border-opacity-50 rounded ps-3 pt-3 mb-2'>
                        <p id='${element.chatId}'>${element.message}</p>
                        <p class='time-sent d-flex justify-content-end me-2'>Sent: ${formatDate(new Date(element.time_sent))}</p>
                    </div>    
                `);
            }
        });
        scrollDown();
    });
}

function formatDate(d){
    return ("0" + d.getDate()).slice(-2) + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" +
    d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
}

function sendMessage(){
    let msg = $('textarea').val();
    if(msg){
        data = {
            message: msg
        }
        socket.emit('chat message', data);
        $('textarea').val("");
    }
}

socket.on('chat message', (msg) =>{
    msg.forEach(element => {
        if(document.getElementById(element.chatId) === null){
            $('#msgs').append(`
                <div class='message-box border border-dark-subtle border-opacity-50 rounded ps-3 pt-3 mb-2'>
                    <p id='${element.chatId}'>${element.message}</p>
                    <p class='time-sent d-flex justify-content-end me-2'>Sent: ${formatDate(new Date(element.time_sent))}</p>
                </div>    
            `);
        }
    });
    scrollDown();
})

function scrollDown(){
    document.getElementById('msgs').scrollIntoView({block: 'end', behavior: 'smooth'});
}

socket.on('total-users', (data) =>{
    if(data.totalUsers > 1){
        if(data.totalUsers > 2){
            $('#total').text(`${data.totalUsers - 1} other users online`);
        }else{
            $('#total').text(`${data.totalUsers - 1} other user online`);
        }
    }else{
        $('#total').text(`Only you online`);
    }
})