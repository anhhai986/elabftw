/**
 * show.js - for the ?mode=show
 *
 * @author Nicolas CARPi <nicolas.carpi@curie.fr>
 * @copyright 2012 Nicolas CARPi
 * @see https://www.elabftw.net Official website
 * @license AGPL-3.0
 * @package elabftw
 */
(function() {
    'use strict';

    $(document).ready(function(){

        // CREATE EXPERIMENT
        key($('#shortcuts').data('create'), function() {
            window.location.href = 'app/controllers/ExperimentsController.php?create=true';
        });

        // the reset button
        $('.submit-reset').on('click', function() {
            window.location.href = '?mode=show';
        });

        // validate the form upon change. fix #451
        $('.form-control').on('change', function() {
            $('#filter-order-sort').submit();
        });

        // bodyToggleImg is the little +/- image
        $('.bodyToggleImg').click(function() {
            // transform the + in - and vice versa
            $(this).children().toggleClass('fa-minus-circle').toggleClass('fa-plus-circle');

            // get the id to show the toggleBody
            let id = $(this).parent().attr('id');
            const idArr = id.split("_");
            id = idArr[1];
            // get html of body
            $.post('app/controllers/EntityController.php', {
                'getBody' : true,
                'id' : id,
                'type' : $(this).data('type')
            // and put it in the div and show the div
            }).done(function(data) {
                $('#bodyToggle_' + id).html(data.msg);
                // get the width of the parent. The -30 is to make it smaller than parent even with the margins
                const width = $('#parent_' + id).width() - 30;
                // adjust the width of the children
                $('#bodyToggle_' + id).css('width', width);
                // display div
                $('#bodyToggle_' + id).toggle();
                // ask mathjax to reparse the page
                MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
            });
        });

        // PAGINATION
        // previous page
        $(document).on('click', '.previousPage', function() {
            insertParamAndReload('offset', $('#infos').data('offset') - $('#infos').data('limit'));
        });
        // next page
        $(document).on('click', '.nextPage', function() {
            insertParamAndReload('offset', $('#infos').data('offset') + $('#infos').data('limit'));
        });
        // END PAGINATION

        // THE CHECKBOXES
        function getCheckedBoxes() {
            var checkedBoxes = [];
            $("input[type=checkbox]:checked").each(function() {
                    checkedBoxes.push($(this).data('id'));
            });
            return checkedBoxes;
        }

        var bgColor = '#c4f9ff';

        // CHECK A BOX
        $('input[type=checkbox]').on('click', function() {
            if ($(this).prop('checked')) {
                $(this).parent().parent().css('background-color', bgColor);
            } else {
                $(this).parent().parent().css('background-color', '');
            }
        });

        // SELECT ALL
        $('#selectAllBoxes').click(function() {
            $('input[type=checkbox]').prop('checked', true);
            $('input[type=checkbox]').parent().parent().css('background-color', bgColor);
            $('#advancedSelectOptions').show();
            $('#withSelected').show();
            // also disable pagination because this will select all even the hidden ones
            $('section.item:hidden').show();
            $('#loadAllButton').hide(); // hide load button when there is nothing more to show
            $('#loadButton').hide(); // hide load button when there is nothing more to show
        });

        // UNSELECT ALL
        $('#unselectAllBoxes').click(function() {
            $('input:checkbox').prop('checked', false);
            $('input[type=checkbox]').parent().parent().css('background-color', '');
        });

        // INVERT SELECTION
        $('#invertSelection').click(function() {
            $('input[type=checkbox]').each(function () {
                this.checked = !this.checked;
                if ($(this).prop('checked')) {
                    $(this).parent().parent().css('background-color', bgColor);
                } else {
                    $(this).parent().parent().css('background-color', '');
                }
            });
        });

        // hide the "with selected" block if no checkboxes are checked
        $('#withSelected').hide();
        // no need to show the unselect/invert links if no one is selected
        $('#advancedSelectOptions').hide();
        $('input[type=checkbox]').click(function() {
            $('#advancedSelectOptions').show();
            $('#withSelected').show();
        });

        // UPDATE THE STATUS/ITEM TYPE OF SELECTED BOXES ON SELECT CHANGE
        $('#catChecked').on('change', function() {
            var ajaxs = [];
            // get the item id of all checked boxes
            var checked = getCheckedBoxes();
            // loop on it and update the status/item type
            $.each(checked, function(index, value) {
                ajaxs.push($.post('app/controllers/EntityController.php', {
                    updateCategory : true,
                    id : value,
                    categoryId : $('#catChecked').val(),
                    type : $('#type').data('type')
                }));
            });
            // reload the page once it's done
            // a simple reload would not work here
            // we need to use when/then
            $.when.apply(null, ajaxs).then(function (){
                window.location.reload();
            });
        });

        // UPDATE THE VISIBILTY OF AN EXPERIMENT ON SELECT CHANGE
        $('#visChecked').on('change', function() {
            var ajaxs = [];
            // get the item id of all checked boxes
            var checked = getCheckedBoxes();
            // loop on it and update the status/item type
            $.each(checked, function(index, value) {
                ajaxs.push($.post('app/controllers/EntityController.php', {
                    updateVisibility : true,
                    id : value,
                    visibility : $('#visChecked').val(),
                    type : $('#type').data('type')
                }));
            });
            // reload the page once it's done
            // a simple reload would not work here
            // we need to use when/then
            $.when.apply(null, ajaxs).then(function (){
                window.location.reload();
            });
            notif('Saved', 'ok');
        });

        // MAKE ZIP/CSV
        $('.csvzip').on('click', function() {
            // grey out the box to signal it has been clicked
            $(this).attr('disabled', 'disabled');
            // also display a wait text
            $(this).html('Please wait…');
            var type = $('#type').data('type');
            var checked = getCheckedBoxes();
            var what = $(this).data('what');
            window.location.href = 'make.php?what=' + what + '&type=' + type + '&id=' + checked.join('+');
        });

        // THE DELETE BUTTON FOR CHECKED BOXES
        $('#deleteChecked').on('click', function() {
            if (!confirm('Delete this?')) {
                return false;
            }
            // get the item id of all checked boxes
            var checked = getCheckedBoxes();
            // loop on it and delete stuff
            $.each(checked, function(index, value) {
                $.post('app/controllers/EntityController.php', {
                    destroy: true,
                    id: value,
                    type: $('#type').data('type')
                }).done(function(data) {
                    if (data.res) {
                        // hide the div
                        $('#parent_' + value).hide(200);
                        notif(data.msg, 'ok');
                    } else {
                        notif(data.msg, 'ko');
                    }
                });
            });
        });
    });
}());
