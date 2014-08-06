function erroroutput(msg)
{
	$("#error").html($("#error").html() + msg + "<br />");
}  

function change_base(num, from, to, length)
{
	num = parseInt(num, from);
	new_num = num.toString(to);
	while (new_num.length < length)
	{
		new_num = "0" + new_num;
	}

	return new_num;
}

var src = '';

function draw_line (axes, left_x, left_y, right_x, right_y)
{
	var min_x = Math.floor(axes.o_x + axes.scale * left_x);
	var max_y = Math.floor(axes.o_y - axes.scale * left_y);	
}

function draw_rectangle (axes, bottom_x, bottom_y, width, height, colour)
{
	var min_x = Math.floor(axes.o_x + axes.scale * bottom_x);
	var max_y = Math.floor(axes.o_y - axes.scale * bottom_y);
	var max_x = Math.floor(axes.o_x + axes.scale * (bottom_x + width));
	var min_y = Math.floor(axes.o_y - axes.scale * (bottom_y + height));
	if (width < 0 && height >= 0)
	{
		describe = 'e';
	}
	else if (width >= 0 && height >= 0)
	{
		describe = 'f';
	}
	else if (width >=0 && height < 0)
	{
		describe = 'g';
	}
	else
	{
		describe = 'h';
	}

	src = src + describe + change_base(min_x, 10, 36, 4) + "" + change_base(min_y, 10, 36, 4) + "" + change_base(Math.abs(max_x - min_x), 10, 36, 4) + "" + change_base(Math.abs(max_y - min_y), 10, 36, 4) + "" + colour + ";";
}

function draw_triangle(axes, x_1, y_1, width, height, colour)
{
	var x_2 = Math.floor(axes.o_x + (x_1 + width) * axes.scale);
	var y_2 = Math.floor(axes.o_y - (y_1 + height) * axes.scale);
	var x_1 = Math.floor(axes.o_x + x_1 * axes.scale);
	var y_1 = Math.floor(axes.o_y - y_1 * axes.scale);
	if (width < 0 && height < 0)
	{
		describe = 'a';
	}
	else if (width >= 0 && height < 0)
	{
		describe = 'b';
	}
	else if (width >=0 && height >= 0)
	{
		describe = 'c';
	}
	else
	{
		describe = 'd';
	}

	src = src + describe + change_base(x_1, 10, 36, 4) + "" + change_base(y_1, 10, 36, 4) + "" + change_base (Math.abs(x_2 - x_1), 10, 36, 4) + "" + change_base(Math.abs(y_2 - y_1), 10, 36, 4) + "" + colour + ";";
}

function draw_clear()
{
	$("#error").html('');
	src = '';
}


function resize()
{
	width = $(window).width() * 0.45;
	height = $(window).height();
	if (width < height)
	{
		$("#preview").css("height", width + "px");
		$("#preview").css("width", width + "px");
	}
	else
	{
		$("#preview").css("width", height + "px");
		$("#preview").css("height", height + "px");
	}	

}

function redraw() {

// Prelims
var total_height = 0;
var total_width = 0;
draw_clear();

var stem_height = parseInt($("#stem_height").val());
var stem_thickness = parseInt($("#stem_thickness").val());
var toe_length = parseInt($("#toe_length").val());
var heel_length = parseInt($("#heel_length").val());
var base_thickness = parseInt($("#base_thickness").val());
var shear_key_height = 0;
var shear_key_thickness = 0;

var box_x = 1200;
var box_y = 1200;
var x_margin = 300;
var y_margin = 100;
var inner_x = box_x - 2 * x_margin;
var inner_y = box_y - 2 * y_margin;

if ($("#shear_key").val() == 'yes')
{
	shear_key_height = parseInt($("#shear_key_height").val());
	shear_key_thickness = parseInt($("#shear_key_thickness").val());
}

total_height = stem_height + base_thickness + shear_key_height;
total_width = toe_length + heel_length + stem_thickness;

var axes = {scale: 0, o_x: 0, o_y: 0, left_edge: 0, right_edge: 0};

if ((inner_y / total_height) < (inner_x / total_width))
{
	axes.scale = inner_y / total_height;
	axes.o_y = box_y - y_margin - axes.scale * shear_key_height;
	axes.o_x = x_margin + (inner_x - axes.scale * total_width) / 2;
	axes.left_edge = -axes.o_x / axes.scale;
	axes.right_edge = axes.o_x / axes.scale;
}
else
{
	axes.scale = inner_x / total_width;
	axes.o_x = x_margin;
	axes.left_edge = -x_margin / axes.scale;
	axes.right_edge = x_margin / axes.scale;
	axes.o_y = box_y - (box_y - axes.scale * total_height) / 2;
}

var retaining_wall = '444444';
var surface = stem_height + base_thickness;
var back_detail_start = 0;
var front_detail_start = 0;
var footing = 0;

// Standard Parts ----------------------------------------------------------------------
draw_rectangle(axes, 0, 0, total_width, base_thickness, retaining_wall);
draw_rectangle(axes, toe_length, base_thickness, stem_thickness, stem_height, retaining_wall);

if ($("#shear_key").val() == 'yes')
{
	if (shear_key_thickness <= total_width)
	{
		draw_rectangle(axes, total_width - shear_key_thickness, -shear_key_height, shear_key_thickness, shear_key_height, retaining_wall);
	}
	else
	{
		$("#shear_key_thickness").removeClass('nonerror').addClass('error');
		erroroutput ('Shear key is too thick');	
	}
	footing = -shear_key_height;
}

// Detailing ----------------------------------------------------------------------------
if ($("#back_detailing").val() == 'stepped')
{
	step_depth = parseInt($("#back_step_depth").val());
	step_run = parseInt($("#back_step_run").val());
	steps = parseInt($("#back_steps").val())

	if ((steps * step_depth) <= stem_height && (step_run * steps) <= heel_length)
	{
		$("#back_step_depth").removeClass('error').addClass('nonerror');
		$("#back_step_run").removeClass('error').addClass('nonerror');
		for (i = 0; i < steps; i++)
		{
			draw_rectangle(axes, toe_length + stem_thickness, base_thickness + i * step_depth, heel_length - (i+1) * step_run, step_depth, retaining_wall);
		}
		back_detail_start = base_thickness + i * step_depth;
	}
	else
	{
		if ((steps * step_depth) > stem_height)
		{
			$("#back_step_depth").removeClass('nonerror').addClass('error');
			erroroutput ('Retaining face detailing exceeds stem height');
		}

		if ((step_run * steps) > toe_length)
		{
			$("#back_step_run").removeClass('nonerror').addClass('error');
			erroroutput ('Retaining face detailing exceeds toe length');
		}
		back_detail_start = 0;
	}
}

if ($("#back_detailing").val() == 'inclined')
{
	chamfer_width = parseInt($("#back_chamfer_width").val());
	chamfer_height = parseInt($("#back_chamfer_height").val());

	if (chamfer_height <= stem_height && chamfer_width <= heel_length)
	{
		draw_triangle(axes, toe_length + stem_thickness, base_thickness, chamfer_width, chamfer_height, retaining_wall);
		back_detail_start = base_thickness + chamfer_height;
	}
	else
	{
		if (chamfer_height > stem_height)
		{
			$("#back_chamfer_height").removeClass('nonerror').addClass('error');
			erroroutput ('Retaining face detailing exceeds stem height');
		}
		if (chamfer_width > toe_length)
		{
			$("#back_chamfer_width").removeClass('nonerror').addClass('error');
			erroroutput ('Retaining face detailing exceeds stem width');
		}
		back_detail_start = 0;
	}
}

if ($("#front_detailing").val() == 'stepped')
{
	step_depth = parseInt($("#front_step_depth").val());
	step_run = parseInt($("#front_step_run").val());
	steps = parseInt($("#front_steps").val())

	if ((steps * step_depth) <= stem_height && (step_run * steps) <= toe_length)
	{
		for (i = 0; i < parseInt($("#front_steps").val()); i++)
		{
			draw_rectangle(axes, step_run * (i+1), base_thickness + i * step_depth, toe_length - step_run * (i+1), step_depth, retaining_wall);
		}
		front_detail_start = base_thickness + i * step_depth;
	}
	else
	{
		if ((steps * step_depth) > stem_height)
		{
			$("#front_step_depth").removeClass('nonerror').addClass('error');
			erroroutput ('Front face detailing exceeds stem height');
		}

		if ((step_run * steps) > toe_length)
		{
			$("#front_step_run").removeClass('nonerror').addClass('error');
			erroroutput ('Front face detailing exceeds toe length');
		}
		front_detail_start = 0;
	}
}

if ($("#front_detailing").val() == 'inclined')
{
	chamfer_width = parseInt($("#front_chamfer_width").val());
	chamfer_height = parseInt($("#front_chamfer_height").val());

	if (chamfer_height <= stem_height && chamfer_width <= toe_length)
	{
		draw_triangle(axes, toe_length, base_thickness, -chamfer_width, chamfer_height, retaining_wall);
		front_detail_start = base_thickness + chamfer_height;
	}
	else
	{
		if (chamfer_height > stem_height)
		{
			$("#front_chamfer_height").removeClass('nonerror').addClass('error');
			erroroutput ('Front face detailing exceeds stem height');
		}
		if (chamfer_width > toe_length)
		{
			$("#front_chamfer_width").removeClass('nonerror').addClass('error');
			erroroutput ('Front face detailing exceeds stem width');
		}
		front_detail_start = 0;
	}
}

// Retaining Soil ------------------------------------------------------------------
var current_depth = surface;
var count = 0;
detail_start = back_detail_start;

$('.retained_layer').each(function(i, obj){
	count = count + 1;
	depth = parseInt($(obj).children('.soil_depth').val());
	colour = Math.round((1 - (count % 25) / 25) * 256) * 256 * 256 + Math.round((1 - (count % 5) / 5) * 256) * 256;

	colourHEX = colour.toString(16);
	detail = false;

	if (current_depth > detail_start)
	{
		if ((current_depth - depth) >= detail_start)
		{
			// No detailing to worry about
			draw_rectangle(axes, toe_length + stem_thickness, current_depth - depth, heel_length, depth, colourHEX);
		}
		else
		{
			// Transition into detailing
			draw_rectangle(axes, toe_length + stem_thickness, detail_start, heel_length, current_depth - detail_start, colourHEX);
			draw_rectangle(axes, total_width, current_depth - depth, axes.right_edge, depth, colourHEX);

			depth = depth - (current_depth - detail_start);
			current_depth = detail_start;
			detail = true;
		}
	}
	else
	{
		if (current_depth >= footing && (current_depth - depth) >= footing)
		{
			// Fully in detailing area
			detail = true;

		}
		else if (current_depth >= footing && (current_depth - depth) < footing)
		{
			// Partially over specified
			detail = true;
			depth = current_depth - footing;
		}
		else
		{
			// Over specified don't bother
		}
	}

	if (detail == true)
	{
		layer_top = detail_start - current_depth;
		layer_bot = detail_start - current_depth + depth;

		if ($("#back_detailing").val() == 'inclined')
		{
			chamfer_width = parseInt($("#back_chamfer_width").val());
			chamfer_height = parseInt($("#back_chamfer_height").val());
			detail_width = chamfer_width;

			x_bot = layer_bot * chamfer_width / chamfer_height;

			draw_triangle(axes, toe_length + stem_thickness + x_bot, detail_start - layer_top, - depth * chamfer_width / chamfer_height, -depth, colourHEX);
			draw_rectangle(axes, toe_length + stem_thickness + x_bot, detail_start - layer_bot, chamfer_width * (1 - depth / chamfer_height), depth, colourHEX);
		}
		else if ($("#back_detailing").val() == 'stepped')
		{
			step_depth = parseInt($("#back_step_depth").val());
			step_run = parseInt($("#back_step_run").val());
			steps = parseInt($("#back_steps").val())
			detail_width = heel_length;

			current_step = Math.floor(layer_top / step_depth) + 1;
			remaining_depth = depth;
			top_depth = current_depth;
			while (remaining_depth > step_depth && current_step <= steps)
			{				

				bottom = detail_start - current_step * step_depth;
				draw_rectangle (axes, total_width - step_run * (steps - current_step + 1), top_depth, step_run * (steps - current_step+ 1), bottom - top_depth, colourHEX);
				
				remaining_depth = remaining_depth - (top_depth - bottom);
				top_depth = bottom;
				current_step = current_step + 1;

			}
			// Draw last part
			draw_rectangle(axes, total_width - step_run * (steps - current_step + 1), top_depth, step_run * (steps - current_step+1), -remaining_depth, colourHEX);
		}

		// Outside of detail area
		draw_rectangle(axes, toe_length + stem_thickness + detail_width, current_depth - depth, heel_length - detail_width, depth, colourHEX);
	}
	draw_rectangle(axes, total_width, current_depth - depth, axes.right_edge, depth, colourHEX);

	current_depth = current_depth - depth;
});

// Cover Soil ------------------------------------------------------------------
// Find total cover depth first
var current_depth = base_thickness;
$('.cover_layer').each(function(i, obj){
	current_depth = current_depth + parseInt($(obj).children('.soil_depth').val());
});

footing = 0;
detail_start = front_detail_start;
var count = 0;
$('.cover_layer').each(function(i, obj){
	count = count + 1;
	depth = parseInt($(obj).children('.soil_depth').val());
	colour = Math.round((1 - (count % 25) / 25) * 256) * 256 * 256 + Math.round((1 - (count % 5) / 5) * 256) * 256;

	colourHEX = colour.toString(16);
	detail = false;

	if (current_depth > detail_start)
	{
		if ((current_depth - depth) >= detail_start)
		{
			// No detailing to worry about
			draw_rectangle(axes, 0, current_depth - depth, toe_length, depth, colourHEX);
		}
		else
		{
			// Transition into detailing
			draw_rectangle(axes, 0, detail_start, toe_length, current_depth - detail_start, colourHEX);
			draw_rectangle(axes, 0, current_depth - depth, axes.left_edge, depth, colourHEX);

			depth = depth - (current_depth - detail_start);
			current_depth = detail_start;
			detail = true;
		}
	}
	else
	{
		if (current_depth >= footing && (current_depth - depth) >= footing)
		{
			// Fully in detailing area
			detail = true;

		}
		else if (current_depth >= footing && (current_depth - depth) < footing)
		{
			// Partially over specified
			detail = true;
			depth = current_depth - footing;
		}
		else
		{
			// Over specified don't bother
		}
	}

	if (detail == true)
	{
		layer_top = detail_start - current_depth;
		layer_bot = detail_start - current_depth + depth;

		if ($("#front_detailing").val() == 'inclined')
		{
			chamfer_width = parseInt($("#front_chamfer_width").val());
			chamfer_height = parseInt($("#front_chamfer_height").val());
			detail_width = chamfer_width;

			x_bot = layer_bot * chamfer_width / chamfer_height;

			draw_triangle(axes, toe_length - x_bot, detail_start - layer_top, depth * chamfer_width / chamfer_height, -depth, colourHEX);
			draw_rectangle(axes, toe_length - x_bot, detail_start - layer_bot, -chamfer_width * (1 - depth / chamfer_height), depth, colourHEX);
		}
		else if ($("#front_detailing").val() == 'stepped')
		{
			step_depth = parseInt($("#front_step_depth").val());
			step_run = parseInt($("#front_step_run").val());
			steps = parseInt($("#front_steps").val())
			detail_width = heel_length;

			current_step = Math.floor(layer_top / step_depth) + 1;
			remaining_depth = depth;
			top_depth = current_depth;
			while (remaining_depth > step_depth && current_step <= steps)
			{				

				bottom = detail_start - current_step * step_depth;
				draw_rectangle (axes, 0, top_depth,step_run * (steps - current_step+ 1), bottom - top_depth, colourHEX);
				
				remaining_depth = remaining_depth - (top_depth - bottom);
				top_depth = bottom;
				current_step = current_step + 1;

			}
			// Draw last part
			draw_rectangle(axes, 0, top_depth,step_run * (steps - current_step+1), -remaining_depth, colourHEX);
		}

		// Outside of detail area
		draw_rectangle(axes, 0, current_depth - depth, toe_length - detail_width, depth, colourHEX);
	}

	draw_rectangle(axes, 0, current_depth - depth, axes.left_edge, depth, colourHEX);

	current_depth = current_depth - depth;
});

// Water Table


$("#preview").attr("src", "canvas.php?" + src);
}