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
      .on('submit','.js-crear-banco',todocel.bancos.crearBanco)
      .on('submit','.js-crear-producto',todocel.productos.crearProducto)
      .on('submit','.js-crear-usuario',todocel.users.crearUsuario)
      .on('click','.js-logout',todocel.users.logout)
      .on('click','.js-borrar-banco',todocel.bancos.borrarBanco)
      .on('click','.js-borrar-usuario',todocel.users.borrarUsuario)
      .on('click','.js-modificar-producto',todocel.productos.modificacionProducto)
      .on('click','.js-borrar-producto',todocel.productos.borrarProducto);
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
        url: todocel.config.backend+'/sesiones/loginAdmin',
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
      url: todocel.config.backend+'/usuarios/listarUsuarios',
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
      url: todocel.config.backend+'/usuarios/crearUsuario',
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
      url: todocel.config.backend+'/usuarios/borrarUsuario',
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
    listarUsuarios: listarUsuarios,
    crearUsuario: crearUsuario,
    borrarUsuario: borrarUsuario
  };
})();

todocel.productos = (function () {
  var listarProductos = function () {
    var $tabla = $('.js-listar-productos tbody');
    $tabla.html('');
    var ajx = $.ajax({
      type: 'post',
      url: todocel.config.backend+'/productos/listarProductos',
      dataType: 'json',
      data: ''
    });
    ajx.done(function (resp) {
      var html  = '';
      if (resp.productos) {
        $.each(resp.productos,function (i,v) {
          html += '<tr>'
            +'<td>'+(i+1)+'</td>'
            +'<td>'+v.nombre+'</td>'
            +'<td>'+v.precio+'</td>'
            +'<td>'+v.cantidad+'</td>'
            +'<td><a href="#" class="btn btn-link js-modificar-producto" data-id="'+v.id+'"><span class="fa fa-pencil"></span></a></td>'
            +'<td><a href="#" class="btn btn-link js-borrar-producto" data-id="'+v.id+'"><span class="fa fa-trash-o"></span></a></td>'
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

  var modificacionProducto = function (ev) {
    console.log(ev);
    if(ev) ev.preventDefault();
    var id = $(ev.currentTarget).data('id');
    var ajx = $.ajax({
      type: 'post',
      url: todocel.config.backend+'/productos/detallesProducto',
      dataType: 'json',
      data: {id: id}
    });
    ajx.done(function (resp) {
      var $form = $('.js-actualizar-producto');
      $form.find('input[name=id]').val(resp.id);
      $form.find('input[name=nombre]').val(resp.nombre);
      $form.find('input[name=descripcion]').val(resp.descripcion);
      $form.find('input[name=precio]').val(resp.precio);
      $form.find('input[name=cantidad]').val(resp.cantidad);
      $form.off('submit').on('submit',modificarProducto);
      $('.js-edit-modal').modal('show');
    })
    .fail(function (e) {
      alert('Error: ' + e.message);
    });
  };

  var modificarProducto = function (ev) {
    if(ev) ev.preventDefault();
    var formData = new FormData(ev.target);
    var ajx = $.ajax({
      type: 'post',
      url: todocel.config.backend+'/productos/modificarProducto',
      dataType: 'json',
      data: formData,
      async : false,
      cache : false,
      contentType : false,
      processData : false
    });
    ajx.done(function (resp) {
      alert(resp.msg);
      $('.js-edit-modal').modal('hide');
      listarProductos();
    })
    .fail(function (e) {
      alert('Error: ' + e.message);
    });
  };

  var crearProducto = function (ev) {
    if(ev) ev.preventDefault();
    var formData = new FormData( $('.js-crear-producto')[0] );
    var ajx = $.ajax({
      type: 'post',
      url: todocel.config.backend+'/productos/crearProducto',
      dataType: 'json',
      data: formData,
      async : false,
      cache : false,
      contentType : false,
      processData : false
    });
    ajx.done(function (resp) {
      alert(resp.msg);
      listarProductos();
    })
    .fail(function (e) {
      alert('Error: ' + e.message);
    });
  };

  var borrarProducto = function (ev) {
    if(ev) ev.preventDefault();
    var id = $(ev.currentTarget).data('id');
    var ajx = $.ajax({
      type: 'post',
      url: todocel.config.backend+'/productos/borrarProducto',
      dataType: 'json',
      data: {id:id}
    });
    ajx.done(function (resp) {
      alert(resp.msg);
      listarProductos();
    })
    .fail(function (e) {
      alert('Error: ' + e.message);
    });
  };

  return {
    listarProductos: listarProductos,
    crearProducto: crearProducto,
    borrarProducto: borrarProducto,
    modificacionProducto: modificacionProducto
  };
})();

todocel.bancos = (function () {
  var listarBancos = function () {
    var $tabla = $('.js-listar-bancos tbody');
    $tabla.html('');
    var ajx = $.ajax({
      type: 'post',
      url: todocel.config.backend+'/bancos/listaBancos',
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
      url: todocel.config.backend+'/bancos/crearBanco',
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
      url: todocel.config.backend+'/usuarios/borrarBanco',
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
