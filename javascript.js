document.write('<script src="jquery.js"></script>');

function set_error_msg (msg)
{
	$("#error").html($("#error").html() + msg + ", ");
}

function set_error(element, msg)
{
	element.removeClass('nonerror').addClass('error');
	set_error_msg(msg);
}

function set_nonerror(element)
{
	element.removeClass('error').addClass('nonerror');
}

function get_inputs()
{
	$("#error").html('');

	int_inputs = ['wall_weight', 'stem_height', 'stem_thickness', 'toe_length', 'heel_length', 'base_thickness', 'shear_key_height', 'shear_key_thickness', 'back_steps', 'back_step_run', 'back_step_depth', 'back_angle', 'front_steps', 'front_step_run', 'front_step_depth', 'front_angle', 'water_inside', 'water_outside', 'water_under', 'surcharge'];
	str_inputs = ['back_detailing', 'front_detailing'];
	chkbox_inputs = ['shear_key', 'check_inside', 'check_outside', 'check_under'];

	var i = [];
	for (a=0; a < int_inputs.length; a++)
	{
		input = int_inputs[a];
		i[input] = parseInt($("#" + input).val());
	}
	for (a=0; a < str_inputs.length; a++)
	{
		input = str_inputs[a];
		i[input] = $("#" + input).val();
	}
	for (a=0; a < chkbox_inputs.length; a++)
	{
		input = chkbox_inputs[a];
		i[input] = ($("#" + input).is(':checked') ? true : false);
	}

	layer_info = ['depth', 'weight', 'angle'];
	layers = ['retained', 'cover']
	for (c = 0; c < layers.length; c++)
	{

	i[layers[c]] = [];

	$('.' + layers[c] + '_layer').each(function(a, obj){
		i[layers[c]][a] = [];
		i[layers[c]][a]['name'] = $(obj).children('.soil_name');

		for (b = 0; b < layer_info.length; b++)
		{
		depth = parseInt($(obj).children('.soil_' + layer_info[b]).val());
		if (depth < 0)
		{
			set_error($(obj).children('.soil_' + layer_info[b]), 'Soil ' + layer_info[b] + ' must be positive');
		}
		else
		{
			set_nonerror(($(obj).children('.soil_' + layer_info[b])));
			i[layers[c]][a][layer_info[b]] = depth;
		}
		}
	});

	}

	i['force'] = [];
	$('.force_layer').each(function(a, obj){
		i.force[a] = [];
		i.force[a].pos_x = parseInt($(obj).children('.pos_x').val());
		i.force[a].pos_y = parseInt($(obj).children('.pos_y').val());

		i.force[a].dir_x = parseInt($(obj).children('.force_x').val());
		i.force[a].dir_y = parseInt($(obj).children('.force_y').val());
	});

	i['total_cover'] = 0;
	for (a = 0; a < i.cover.length; a++)
	{
		i.total_cover = i.total_cover + i.cover[a].depth;
	}

	if (i.total_cover > i.stem_height)
	{
		set_error_msg('There is more cover soil than the height of the retaining wall');
	}

	i["total_height"] = i.stem_height + i.base_thickness;
	i["total_width"] = i.toe_length + i.heel_length + i.stem_thickness;

	// ---- QC -----------------------------------------------------------------
	if (i.shear_key)
	{
		if (i.shear_key_thickness > i.total_width)
		{
			set_error($("#shear_key_thickness"), 'Shear key is too thick');
			i.shear_key = false;
		}
		else
		{
			set_nonerror($("#shear_key_thickness"));
			i.total_height = i.total_height + i.shear_key_height;
		}
	}

	if (i.back_detailing == 'stepped')
	{
		if ((i.back_steps * i.back_step_depth) > i.stem_height)
		{
			set_error($("#back_step_depth"), 'Retaining face detailing exceeds stem height');
			i.back_detailing == 'none';
		}
		else
		{
			set_nonerror($("#back_step_depth"));
		}

		if ((i.back_step_run * i.back_steps) > i.heel_length)
		{
			set_error($("#back_step_run"), 'Retaining face detailing exceeds heel length');
			i.back_detailing == 'none';
		}
		else
		{
			set_nonerror($("#back_step_run"));
		}
	}

	if (i.back_detailing == 'inclined')
	{
		if (i.back_angle <= 0)
		{
			i.back_detailing = 'none';
			set_error($("#back_angle"), 'Retaining face angle must be greater than zero');
		}
		else if (i.back_angle > (Math.atan(i.heel_length / i.stem_height) * 180 / Math.PI))
		{
			i.back_detailing = 'none';
			set_error($("back_angle"), 'Retaining face angle is too big for the length of heel specified')
		}
		else
		{
			set_nonerror($("#back_angle"));
			i.back_angle = i.back_angle * Math.PI / 180; 
		}
	}

	if (i.front_detailing == 'stepped')
	{
		if ((i.front_steps * i.front_step_depth) > i.stem_height)
		{
			set_error($("#front_step_depth"), 'Front face detailing exceeds stem height');
			i.front_detailing == 'none';
		}
		else
		{
			set_nonerror($("#front_step_depth"));
		}

		if ((i.front_step_run * i.front_steps) > i.heel_length)
		{
			set_error($("#front_step_run"), 'Front face detailing exceeds heel length');
			i.front_detailing == 'none';
		}
		else
		{
			set_nonerror($("#front_step_run"));
		}
	}

	if (i.front_detailing == 'inclined')
	{
		if (i.front_angle <= 0)
		{
			i.front_detailing = 'none';
			set_error($("#front_angle"), 'Front face angle must be greater than zero');
		}
		else if (i.front_angle > (Math.atan(i.toe_length / i.stem_height) * 180 / Math.PI))
		{
			i.front_detailing = 'none';
			set_error($("front_angle"), 'Front face angle is too big for the length of toe specified')
		}
		else
		{
			set_nonerror($("#front_angle"));
			i.front_angle = i.front_angle * Math.PI / 180; 
		}
	}

	if (i.water_under > 0)
	{
		set_error($("#water_under"), 'Water table under base should be less than 0');
	}
	else
	{
		set_nonerror($("#water_under"));
	}

	if (i.water_outside < 0)
	{
		set_error($("#water_outside"), 'Water table should be higher');
	}
	else
	{
		set_nonerror($("#water_outside"));
	}
	
	if (i.water_inside < 0)
	{
		set_error($("#water_inside"), 'Water table should be higher');
	}
	else
	{
		set_nonerror($("#water_inside"));
	}
	return i;
}


document.write('<script src="layout.js"></script>');
document.write('<script src="calculate.js"></script>');