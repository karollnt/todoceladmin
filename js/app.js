var todocel = (function () {
  var config = {
    $document: $(document),
    backend: 'http://localhost/TodoCel',
    user: window.localStorage.getItem('nickname')
  };

  var init = function () {
    initEvents();
    todocel.users.init();
  };

  var initEvents = function () {
    $(document)
      .on('submit','js-signin-form',todocel.users.login)
      .on('submit','.js-crear-banco',crearBanco)
      .on('click','.js-logout',logout)
      .on('click','.js-borrar-banco',borrarBanco);
  };
  return {
    init: init,
    config: config
  };
})();

todocel.users = (function () {
  var init = function () {
    usuario = window.localStorage.getItem('usuario');
    if(usuario==null || usuario=='' || usuario=='null') {
      if(location.pathname.split('/').slice(-1)[0] != 'sign-in.html') {
        window.location.href = 'sign-in.html';
      }
    }
  };

  var login = function (ev) {
    ev.preventDefault();
    var form = ev.target;
    var jsonForm = todocel.utils.formToJSONString(form);
    jsonForm = JSON.parse(jsonForm);
    if (jsonForm.nickname!='') {
      jsonForm.clave = md5(jsonForm.clave);
      var ajx = $.ajax({
        type: 'post',
        url: waooserver+'/sesiones/loginAdmin',
        dataType: 'json',
        data: jsonForm
      });
      ajx.done(function(resp) {
        if (resp.msg == 'ok') {
          window.localStorage.setItem('usuario',jsonForm.nickname);
          todocel.config.user = jsonForm.nickname;
          form.reset();
          window.location.href = 'index.html';
        }
        else alert(resp.msg);
      })
      .fail(function (e) {
        alert('Error: ' + e.message);
      });
    }
  };

  var logout = function () {
    todocel.config.user = null;
    window.localStorage.setItem('usuario',null);
    window.location.href = 'sign-in.html';
  };

  var listarUsuarios = function () {
    var $tabla = $('.js-listar-usuarios tbody');
    $tabla.html('');
    var ajx = $.ajax({
      type: 'post',
      url: waooserver+'/usuarios/listarUsuarios',
      dataType: 'json',
      data: {col:'estado',val:1}
    });
    ajx.done(function(resp) {
      var html  = '';
      if (resp.usuarios) {
        $.each(resp.usuarios,function (i,v) {
          html += '<tr>'
            +'<td>'+(i+1)+'</td>'
            +'<td>'+v.nickname+'</td>'
            +'<td>'+v.nombre+'</td>'
            +'<td>'+v.email+'</td>'
            +'<td>'+v.tipo+'</td>'
            +'<td><a href="#" class="btn btn-link js-borrar-usuario" data-id="'+v.id+'"><span class="fa fa-trash-o"></span></a></td>'
          +'</tr>';
        });
      }
      else {
        html = '<tr><td colspan="6">No hay registros</td></tr>';
      }
      $tabla.append(html);
    })
    .fail(function (e) {
      alert('Error: ' + e.message);
    });
  };

  var crearUsuario = function (ev) {
    if(ev) ev.preventDefault();
    var $form = $('.js-crear-usuario');
    var datos = $form.serialize();
    var ajx = $.ajax({
      type: 'post',
      url: waooserver+'/usuarios/crearUsuario',
      dataType: 'json',
      data: datos
    });
    ajx.done(function (resp) {
      alert(resp.msg);
      $form[0].reset();
      listarUsuarios();
    })
    .fail(function (e) {
      alert('Error: ' + e.message);
    });
  };

  var borrarUsuario = function (ev) {
    if(ev) ev.preventDefault();
    var id = $(ev.currentTarget).data('id');
    var ajx = $.ajax({
      type: 'post',
      url: waooserver+'/usuarios/borrarUsuario',
      dataType: 'json',
      data: {id:id}
    });
    ajx.done(function (resp) {
      alert(resp.msg);
      listarUsuarios();
    })
    .fail(function (e) {
      alert('Error: ' + e.message);
    });
  };

  return {
    init: init,
    login: login,
    logout: logout,
    listarUsuarios: listarUsuarios
  };
})();

todocel.bancos = (function () {
  var listarBancos = function () {
    var $tabla = $('.js-listar-bancos tbody');
    $tabla.html('');
    var ajx = $.ajax({
      type: 'post',
      url: waooserver+'/bancos/listaBancos',
      dataType: 'json',
      data: ''
    });
    ajx.done(function (resp) {
      var html  = '';
      if(resp.bancos){
        $.each(resp.bancos,function (i,v) {
          html += '<tr>'
            +'<td>'+(i+1)+'</td>'
            +'<td>'+v.nombre+'</td>'
            +'<td><a href="#" class="btn btn-link js-borrar-usuario" data-id="'+v.id+'"><span class="fa fa-trash-o"></span></a></td>'
          +'</tr>';
        });
      }
      else {
        html = '<tr><td colspan="3">No hay registros</td></tr>';
      }
      $tabla.append(html);
    })
    .fail(function (e) {
      alert('Error: ' + e.message);
    });
  };

  var crearBanco = function (ev) {
    if(ev) ev.preventDefault();
    var $form = $(".js-crear-banco");
    var datos = $form.serialize();
    var ajx = $.ajax({
      type: 'post',
      url: waooserver+'/bancos/crearBanco',
      dataType: 'json',
      data: datos
    });
    ajx.done(function(resp) {
      alert(resp.msg);
      $form[0].reset();
      listarBancos();
    })
    .fail(function(e) {
      alert('Error: ' + e.message);
    });
  };

  var borrarBanco = function (ev) {
    if(ev) ev.preventDefault();
    var id = $(ev.currentTarget).data('id');
    var ajx = $.ajax({
      type: 'post',
      url: waooserver+'/usuarios/borrarBanco',
      dataType: 'json',
      data: {id:id}
    });
    ajx.done(function(resp) {
      alert(resp.msg);
      listarBancos();
    })
    .fail(function(e) {
      alert('Error: ' + e.message);
    });
  };

  return {
    listarBancos: listarBancos,
    crearBanco: crearBanco,
    borrarBanco: borrarBanco
  };
})();

todocel.utils = (function () {
  var formToJSONString = function (form) {
    var obj = {};
    var elements = form.querySelectorAll( 'input, select, textarea' );
    for ( var i = 0; i < elements.length; ++i ) {
      var element = elements[i];
      var name = element.name;
      var value = element.value;
      if ( name ) {
        obj[ name ] = value.trim();
      }
    }
    return JSON.stringify( obj );
  };
})();

todocel.init();
