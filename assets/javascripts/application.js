import "./controllers/usermenu_controller.js"
import "./controllers/projectmenu_controller.js"
import "./controllers/queries_controller.js"
import "./controllers/issue_controller.js"
import "./controllers/query_controller.js"
import "./controllers/application_controller.js"
import "./controllers/tabs_controller.js"
import "./controllers/notification_controller.js"
import "./controllers/sidebar_controller.js"
import "./controllers/wiki_controller.js"
import "./controllers/contextual_controller.js"
import "./controllers/calendar_controller.js"

// Turbo.session.drive = false

document.addEventListener("turbo:load", function(e) {
  if(document.querySelector('#menu-breadcrumb')){
    document.querySelector('#menu-breadcrumb').addEventListener('click', function(event){
      event.stopPropagation();
      const breadcrumb = document.querySelector('#breadcrumbs');
      toggle(breadcrumb)
    });

    document.addEventListener('click', function handleClickOutsideBox(event) {
      const breadcrumb = document.querySelector('#breadcrumbs');
      if (!breadcrumb.contains(event.target)) {
        breadcrumb.style.display = "flex"
        toggle(breadcrumb);
      }
    });
  }
});


function toggle(breadcrumb){
  if (breadcrumb.style.display === "none") {
    breadcrumb.style.display = "flex";
  } else {
    breadcrumb.style.display = "none";
  }
}


// context menu
document.addEventListener("turbo:load", function() {
  contextMenuInit();
  $('input[type=checkbox].toggle-selection').on('change', toggleIssuesSelection);
});


function buildFilterRow(field, operator, values) {
  var fieldId = field.replace('.', '_');
  var filterTable = $("#filters-table");
  var filterOptions = availableFilters[field];
  if (!filterOptions) return;
  var operators = operatorByType[filterOptions['type']];
  var filterValues = filterOptions['values'];
  var i, select;

  var tr = $('<div class="filter">').attr('id', 'tr_'+fieldId).html(
    '<td class="field"><input checked="checked" id="cb_'+fieldId+'" name="f[]" value="'+field+'" type="checkbox"><label for="cb_'+fieldId+'"> '+filterOptions['name']+'</label></td>' +
    '<td class="operator"><select id="operators_'+fieldId+'" name="op['+field+']"></td>' +
    '<td class="values"></td>'
  );
  filterTable.append(tr);

  select = tr.find('td.operator select');
  for (i = 0; i < operators.length; i++) {
    var option = $('<option>').val(operators[i]).text(operatorLabels[operators[i]]);
    if (operators[i] == operator) { option.prop('selected', true); }
    select.append(option);
  }
  select.change(function(){ toggleOperator(field); });

  switch (filterOptions['type']) {
  case "list":
  case "list_with_history":
  case "list_optional":
  case "list_optional_with_history":
  case "list_status":
  case "list_subprojects":
    tr.find('td.values').append(
      '<span style="display:none;"><select class="value" id="values_'+fieldId+'_1" name="v['+field+'][]"></select>' +
      ' <span class="toggle-multiselect icon-only '+(values.length > 1 ? 'icon-toggle-minus' : 'icon-toggle-plus')+'">&nbsp;</span></span>'
    );
    select = tr.find('td.values select');
    if (values.length > 1) { select.attr('multiple', true); }
    for (i = 0; i < filterValues.length; i++) {
      var filterValue = filterValues[i];
      var option = $('<option>');
      if ($.isArray(filterValue)) {
        option.val(filterValue[1]).text(filterValue[0]);
        if ($.inArray(filterValue[1], values) > -1) {option.prop('selected', true);}
        if (filterValue.length == 3) {
          var optgroup = select.find('optgroup').filter(function(){return $(this).attr('label') == filterValue[2]});
          if (!optgroup.length) {optgroup = $('<optgroup>').attr('label', filterValue[2]);}
          option = optgroup.append(option);
        }
      } else {
        option.val(filterValue).text(filterValue);
        if ($.inArray(filterValue, values) > -1) {option.prop('selected', true);}
      }
      select.append(option);
    }
    break;
  case "date":
  case "date_past":
    tr.find('td.values').append(
      '<span style="display:none;"><input type="date" name="v['+field+'][]" id="values_'+fieldId+'_1" size="10" class="value date_value" /></span>' +
      ' <span style="display:none;"><input type="date" name="v['+field+'][]" id="values_'+fieldId+'_2" size="10" class="value date_value" /></span>' +
      ' <span style="display:none;"><input type="text" name="v['+field+'][]" id="values_'+fieldId+'" size="3" class="value" /> '+labelDayPlural+'</span>'
    );
    $('#values_'+fieldId+'_1').val(values[0]).datepickerFallback(datepickerOptions);
    $('#values_'+fieldId+'_2').val(values[1]).datepickerFallback(datepickerOptions);
    $('#values_'+fieldId).val(values[0]);
    break;
  case "string":
  case "text":
  case "search":
    tr.find('td.values').append(
      '<span style="display:none;"><input type="text" name="v['+field+'][]" id="values_'+fieldId+'" size="30" class="value" /></span>'
    );
    $('#values_'+fieldId).val(values[0]);
    break;
  case "relation":
    tr.find('td.values').append(
      '<span style="display:none;"><input type="text" name="v['+field+'][]" id="values_'+fieldId+'" size="6" class="value" /></span>' +
      '<span style="display:none;"><select class="value" name="v['+field+'][]" id="values_'+fieldId+'_1"></select></span>'
    );
    $('#values_'+fieldId).val(values[0]);
    select = tr.find('td.values select');
    for (i = 0; i < filterValues.length; i++) {
      var filterValue = filterValues[i];
      var option = $('<option>');
      option.val(filterValue[1]).text(filterValue[0]);
      if (values[0] == filterValue[1]) { option.prop('selected', true); }
      select.append(option);
    }
    break;
  case "integer":
  case "float":
  case "tree":
    tr.find('td.values').append(
      '<span style="display:none;"><input type="text" name="v['+field+'][]" id="values_'+fieldId+'_1" size="14" class="value" /></span>' +
      ' <span style="display:none;"><input type="text" name="v['+field+'][]" id="values_'+fieldId+'_2" size="14" class="value" /></span>'
    );
    $('#values_'+fieldId+'_1').val(values[0]);
    $('#values_'+fieldId+'_2').val(values[1]);
    break;
  }
}