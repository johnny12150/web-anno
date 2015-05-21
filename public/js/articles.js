/**
 * Created by flyx on 3/30/15.
 */

$('#btn_add').click(function() {
    $.ajax({
        url: '/article/add',
        data: $('#form_article').serialize(),
        type:"POST",
        dataType:'JSON',
        success: function(msg){

            if(msg.response) {
                $('#articles').append('<a href="/article/'+ msg.data.id +'" class="list-group-item">' + msg.data.title +'<span class="pull-right">'+ msg.data.created_at +'</span></a>')
                $('#myModal').modal('hide');
                $('#form_article')[0].reset();
            }
        },
        error:function(xhr, ajaxOptions, thrownError){
            console.log(xhr.status);
            console.log(thrownError);
        }
    });

});