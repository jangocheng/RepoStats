// Copyright (c) [2022] [巴拉迪维 BaratSemet]
// [ohUrlShortener] is licensed under Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
// 				 http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
// See the Mulan PSL v2 for more details.

$(document).ready(function() {

  $('.message .close')
  .on('click', function() {
    $(this)
      .closest('.message')
      .transition('fade')
    ;
  });

  $('#form-gitee-authorize').form({
    fields: {
      client_id: {
        rules: [{
          type:'empty',
          prompt:'Client ID 尚未填写'
        }]
      },
      client_secret: {
        rules: [{
          type:'empty',
          prompt:'Client Secret 尚未填写'
        }]
      },
      redirect_url: {
        rules: [{
          type:'empty',
          prompt:'应用回调地址尚未填写'
        }]
      }
    }
  });

  $('#btn-gitee-authorize').click(function(){    
    authForm = $('#form-gitee-authorize');    
    authForm.form('validate form');
    if(authForm.form('is valid')) {
      clientID = authForm.form('get value', 'client_id'),
      clientSecret = authForm.form('get value', 'client_secret'),
      redirectUrl = authForm.form('get value', 'redirect_url'),      
      scopes = authForm.form('get value', 'scopes'),      
      url = `https://gitee.com/oauth/authorize?client_id=`+clientID+`&redirect_uri=`+redirectUrl+`&response_type=code&scope=`+scopes
      window.open(url);      
    }//end of if
  });  

  $('#btn-gitee-token').click(function(){
    authForm = $('#form-gitee-authorize');
    authForm.form('add rule','code',{
      rules: [{
        type: 'empty',
        prompt: '授权 Code 尚未填写'
      }]
    });
    authForm.form('validate form');
    if(authForm.form('is valid')) {
      GetGiteeToken(authForm);
    }
  });
});

function successToast(message) {
  $('body').toast({
    class: 'success',
    displayTime: 2500,
    message: message,    
    showIcon:'exclamation circle',
    showProgress: 'bottom',
    onHidden: function() {location.reload()}
  });
}

function errorToast(message) {
  $('body').toast({
    class: 'error',
    displayTime: 2500,
    message: message,    
    showIcon:'exclamation circle',
    showProgress: 'bottom'
  });
}

function GetGiteeToken(form) {
  authForm = $('#form-gitee-authorize'); 
  var data = JSON.stringify( {
    "client_id" : form.form('get value', 'client_id'),
    "client_secret": form.form('get value', 'client_secret'),
    "redirect_url" : form.form('get value', 'redirect_url'),  
    "code" : form.form('get value', 'code')
  })
  $.ajax({
    type: "POST",
    url: '/admin/gitee/token',    
    contentType: "application/json",
    dataType: "json",
    data: data,
    success: function(data) {            
      $('#gitee-token-message').html('<code>'+data+'</code>');
      $('#gitee-token-message').removeClass('error').addClass('positive').addClass('visible');
    },
    error: function(xhr) {
      $('#gitee-token-message').html('<code>'+xhr.responseText+'</code>');
      $('#gitee-token-message').removeClass('positive').addClass('error').addClass('visible');
    }
  });
}//end of function GetGiteeToken

function enable_crawl(repo_id,repo_name) {
  $('body').modal('confirm','开启爬取','确认开启爬取 <b>'+repo_name+'</b> 代码仓库吗？<br><br> 启用该仓库将在爬取周期内抓取相关数据并更新 Grfana 视图面板。', function(choice){
    if(choice) {
      $.ajax({
        type:"PUT",
        url: "/admin/repos/"+repo_id+"/change_state",
        data: {          
          "enable": true,
          "type": "gitee"
        },
        success: function() {
          successToast('操作成功')
        },
        error: function(e) {
          errorToast($.parseJSON(e.responseText).message)
        }
      });
    }//end of if
  });
}

function disable_crawl(repo_id,repo_name) {
  $('body').modal('confirm','禁止爬取','确认禁止爬取 <b>'+repo_name+'</b> 代码仓库吗？<br><br> 禁止该仓库将不再抓取相关数据，已有数据不受影响。', function(choice){
    if(choice) {
      $.ajax({
        type:"PUT",
        url: "/admin/repos/"+repo_id+"/change_state",
        data: {          
          "enable": false,
          "type": "gitee"
        },
        success: function() {
          successToast('操作成功')
        },
        error: function(e) {
          errorToast($.parseJSON(e.responseText).message)
        }
      });
    }//end of if
  });
}

function delete_repo(repo_id,repo_name) {
  $('body').modal('confirm','删除仓库','确认删除 <b>'+repo_name+'</b> 代码仓库吗？<br><br> 删除该仓库将会同步删除相关的统计数据及 Grfana 视图面板。', function(choice){
    if(choice) {
      $.ajax({
        type:"POST",
        url: "/admin/repos/"+repo_id+"/delete",
        data: {
          "type": "gitee"
        },
        success: function() {
          successToast('操作成功')
        },
        error: function(e) {
          errorToast($.parseJSON(e.responseText).message)
        }
      });
    }//end of if
  });
}