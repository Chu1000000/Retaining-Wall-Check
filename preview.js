// --- Primary drawing functions
// Takes inputs in local coordiante system whereby the toe of the retaining wall is (0,0)
// x is positive right and y is positive up 
// Translates onto drawing coordiante system whereby the origin is in the top left corner
// x is positive right and y is positive down and coordinates are scaled onto a 1200 x1200 palette

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
	if (right_x < left_x)
	{
		a = left_x;
		left_x = right_x;
		right_x = a;
	}
	if (left_y < right_y)
	{
		a = left_y;
		left_y = right_y;
		right_y = a;
	}


	var width = Math.floor(axes.scale * (right_x - left_x));
	var height = Math.floor(axes.scale * (left_y - right_y));
	var left_x = Math.floor(axes.o_x + axes.scale * left_x);
	var left_y = Math.floor(axes.o_y - axes.scale * left_y);	

	src = src + "w" + change_base(left_x, 10, 36, 4) + "" + change_base(left_y, 10, 36, 4) + "" + change_base(width, 10, 36, 4) + "" + change_base(height, 10, 36, 4) + ";";
}

function draw_rectangle (axes, bottom_x, bottom_y, width, height, colour)
{
	if (width < 0)
	{
		bottom_x = bottom_x + width;
	}

	if (height < 0)
	{
		bottom_y = bottom_y + height;
	}

	width = Math.abs(width);
	height = Math.abs(height);

	var min_x = Math.floor(axes.o_x + axes.scale * bottom_x);
	var max_y = Math.floor(axes.o_y - axes.scale * bottom_y);
	var max_x = Math.floor(axes.o_x + axes.scale * (bottom_x + width));
	var min_y = Math.floor(axes.o_y - axes.scale * (bottom_y + height));

	src = src + "r" + change_base(min_x, 10, 36, 4) + "" + change_base(min_y, 10, 36, 4) + "" + change_base(Math.abs(max_x - min_x), 10, 36, 4) + "" + change_base(Math.abs(max_y - min_y), 10, 36, 4) + "" + colour + ";";
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

function draw_surcharge(axes, x, y)
{
	x = axes.o_x + axes.scale * x;
	y = axes.o_y - axes.scale * y;

	src = src + "s" + change_base(x, 10, 36, 4) + "" + change_base(y, 10, 36, 4) + ";";
}

function draw_arrow(axes, x_1, y_1, left_or_right, up_or_down)
{
	x_1 = axes.o_x + axes.scale * x_1;
	y_1 = axes.o_y - axes.scale * y_1;

	length = 50;
	x_2 = x_1 + left_or_right * length;
	y_2 = y_1 - up_or_down * length;

	src = src + "p" + change_base(x_1, 10, 36, 4) + "" + change_base(y_1, 10, 36, 4) + change_base(x_2, 10, 36, 4) + change_base(y_2, 10, 36, 4) + ";";
}

function draw_clear()
{
	src = '';
}

// --- Draw to palette ----------------------------------------------
function resize()
{
	width = $(window).width() * 0.45;
	height = $(window).height() * 0.8;
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
draw_clear();

i = get_inputs();

var box_x = 1200;
var box_y = 1200;
var x_margin = 300;
var y_margin = 100;
var inner_x = box_x - 2 * x_margin;
var inner_y = box_y - 2 * y_margin;

var axes = {scale: 0, o_x: 0, o_y: 0, left_edge: 0, right_edge: 0};

if ((inner_y / i.total_height) < (inner_x / i.total_width))
{
	axes.scale = inner_y / i.total_height;
	axes.o_y = box_y - y_margin - axes.scale * i.shear_key_height;
	axes.o_x = x_margin + (inner_x - axes.scale * total_width) / 2;
	axes.left_edge = -axes.o_x / axes.scale;
	axes.right_edge = axes.o_x / axes.scale;
}
else
{
	axes.scale = inner_x / i.total_width;
	axes.o_x = x_margin;
	axes.left_edge = -x_margin / axes.scale;
	axes.right_edge = x_margin / axes.scale;
	axes.o_y = box_y - (box_y - axes.scale * i.total_height) / 2;
}

var retaining_wall = '444444';
var back_detail_start = 0;
var front_detail_start = 0;
var footing = 0;

// Standard Parts ----------------------------------------------------------------------
draw_rectangle(axes, 0, 0, i.total_width, i.base_thickness, retaining_wall);
draw_rectangle(axes, i.toe_length, i.base_thickness, i.stem_thickness, i.stem_height, retaining_wall);

if (i.shear_key != false)
{
	draw_rectangle(axes, i.total_width - i.shear_key_thickness, -i.shear_key_height, i.shear_key_thickness, i.shear_key_height, retaining_wall);
	footing = -i.shear_key_height;
}

// Detailing ----------------------------------------------------------------------------
if (i.back_detailing == 'stepped')
{
	step_depth = i.back_step_depth;
	step_run = i.back_step_run;
	steps = i.back_steps;

	for (a = 0; a < steps; a++)
	{
		draw_rectangle(axes, i.toe_length + i.stem_thickness, i.base_thickness + a * step_depth, i.heel_length - (a+1) * step_run, step_depth, retaining_wall);
	}
	back_detail_start = i.base_thickness + a * step_depth;
}
if (i.back_detailing == 'inclined')
{
	chamfer_height = i.stem_height;
	chamfer_width = chamfer_height * Math.tan(i.back_angle);

	draw_triangle(axes, i.toe_length + i.stem_thickness, i.base_thickness, chamfer_width, chamfer_height, retaining_wall);
	back_detail_start = i.base_thickness + chamfer_height;
}
if (i.front_detailing == 'stepped')
{
	step_depth = i.front_step_depth;
	step_run = i.front_step_run;
	steps = i.front_steps;

	for (a = 0; a < steps; a++)
	{
		draw_rectangle(axes, (a+1) * step_run, i.base_thickness + a * step_depth, i.toe_length - (a+1) * step_run, step_depth, retaining_wall);
	}
	front_detail_start = i.base_thickness + a * step_depth;
}

if (i.front_detailing == 'inclined')
{
	chamfer_height = i.stem_height;
	chamfer_width = chamfer_height * Math.tan(i.front_angle);

	draw_triangle(axes, i.toe_length, i.base_thickness, -chamfer_width, chamfer_height, retaining_wall);
	front_detail_start = i.base_thickness + chamfer_height;
}

// Retaining Soil ------------------------------------------------------------------
var current_depth = i.stem_height + i.base_thickness;
detail_start = back_detail_start;
for (a = 0; a < i.retained.length; a++)
{
	depth = i.retained[a].depth;
	colour = Math.round((1 - ((a+1) % 25) / 25) * 256) * 256 * 256 + Math.round((1 - ((a+1) % 5) / 5) * 256) * 256;

	colourHEX = colour.toString(16);
	detail = false;

	if (current_depth > detail_start)
	{
		if ((current_depth - depth) >= detail_start)
		{
			// No detailing to worry about
			draw_rectangle(axes, i.toe_length + i.stem_thickness, current_depth - depth, i.heel_length, depth, colourHEX);
		}
		else
		{
			// Transition into detailing
			draw_rectangle(axes, i.toe_length + i.stem_thickness, detail_start, i.heel_length, current_depth - detail_start, colourHEX);
			draw_rectangle(axes, i.total_width, current_depth - depth, axes.right_edge, depth, colourHEX);

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

		if (i.back_detailing == 'inclined')
		{
			chamfer_height = i.stem_height;
			chamfer_width = chamfer_height * Math.tan(i.back_angle);
			detail_width = chamfer_width;

			x_bot = layer_bot * chamfer_width / chamfer_height;

			draw_triangle(axes, i.toe_length + i.stem_thickness + x_bot, detail_start - layer_top, - depth * chamfer_width / chamfer_height, -depth, colourHEX);
			draw_rectangle(axes, i.toe_length + i.stem_thickness + x_bot, detail_start - layer_bot, chamfer_width * (1 - depth / chamfer_height), depth, colourHEX);
		}
		else if (i.back_detailing == 'stepped')
		{
			detail_width = i.heel_length;

			current_step = Math.floor(layer_top / i.back_step_depth) + 1;
			remaining_depth = depth;
			top_depth = current_depth;
			while (remaining_depth > i.back_step_depth && current_step <= i.back_steps)
			{				
				bottom = detail_start - current_step * i.back_step_depth;
				draw_rectangle (axes, total_width - i.back_step_run * (i.back_steps - current_step + 1), top_depth, i.back_step_run * (i.back_steps - current_step+ 1), bottom - top_depth, colourHEX);
				
				remaining_depth = remaining_depth - (top_depth - bottom);
				top_depth = bottom;
				current_step = current_step + 1;

			}
			// Draw last part
			draw_rectangle(axes, i.total_width - i.back_step_run * (i.back_steps - current_step + 1), top_depth, i.back_step_run * (steps - current_step+1), -remaining_depth, colourHEX);
		}

		// Outside of detail area
		draw_rectangle(axes, i.toe_length + i.stem_thickness + detail_width, current_depth - depth, i.heel_length - detail_width, depth, colourHEX);
	}
	draw_rectangle(axes, i.total_width, current_depth - depth, axes.right_edge, depth, colourHEX);

	current_depth = current_depth - depth;
}

// Cover Soil ------------------------------------------------------------------
// Find total cover depth first
var current_depth = i.base_thickness + i.total_cover;
footing = 0;
detail_start = front_detail_start;

for (a = 0; a < i.cover.length; a++)
{
	depth = i.cover[a].depth;
	colour = Math.round((1 - ((a+1) % 25) / 25) * 256) * 256 * 256 + Math.round((1 - ((a+1) % 5) / 5) * 256) * 256;

	colourHEX = colour.toString(16);
	detail = false;

	if (current_depth > detail_start)
	{
		if ((current_depth - depth) >= detail_start)
		{
			// No detailing to worry about
			draw_rectangle(axes, 0, current_depth - depth, i.toe_length, depth, colourHEX);
		}
		else
		{
			// Transition into detailing
			draw_rectangle(axes, 0, detail_start, i.toe_length, current_depth - detail_start, colourHEX);
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

		if (i.front_detailing == 'inclined')
		{
			chamfer_height = i.stem_height;
			chamfer_width = chamfer_height * Math.tan(i.back_angle);
			detail_width = chamfer_width;

			x_bot = layer_bot * chamfer_width / chamfer_height;

			draw_triangle(axes, i.toe_length - x_bot, detail_start - layer_top, depth * chamfer_width / chamfer_height, -depth, colourHEX);
			draw_rectangle(axes, i.toe_length - x_bot, detail_start - layer_bot, -chamfer_width * (1 - depth / chamfer_height), depth, colourHEX);
		}
		else if (i.front_detailing == 'stepped')
		{
			detail_width = i.heel_length;

			current_step = Math.floor(layer_top / i.front_step_depth) + 1;
			remaining_depth = depth;
			top_depth = current_depth;
			while (remaining_depth > i.front_step_depth && current_step <= i.front_steps)
			{				
				bottom = detail_start - current_step * i.front_step_depth;
				draw_rectangle (axes, 0, top_depth, i.front_step_run * (i.front_steps - current_step+ 1), bottom - top_depth, colourHEX);
				
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
}

// Water Table ------------------------------------------------------------------
if (i.check_inside)
{
	draw_line(axes, axes.left_edge, i.water_inside, i.toe_length, i.water_inside);
}

if (i.check_under)
{
	draw_line(axes, 0, i.water_under, i.total_width, i.water_under);
}

if (i.check_outside)
{
	draw_line(axes, i.stem_thickness + i.toe_length, i.water_outside, i.total_width + axes.right_edge, i.water_outside);
}

// Surcharge ------------------------------------------------------------------
if (i.surcharge > 0)
{
	draw_surcharge(axes, i.stem_thickness + i.toe_length, i.stem_height + i.base_thickness);
}

// Forces ---------------------------------------------------------------------

for (a = 0; a < i.force.length; a++)
{
	if (i.force[a].dir_x != 0)
	{
		dir_x = i.force[a].dir_x / Math.abs(i.force[a].dir_x);
		draw_arrow(axes, i.force[a].pos_x, i.force[a].pos_y, dir_x, 0);
	}
	
	if (i.force[a].dir_y != 0)
	{
		dir_y = i.force[a].dir_y / Math.abs(i.force[a].dir_y);
		draw_arrow(axes, i.force[a].pos_x, i.force[a].pos_y, 0, dir_y);
	}
}

$("#preview").attr("src", "canvas.php?" + src);
}