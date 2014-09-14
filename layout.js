var regions = {triangles: [], rectangles: []};
var region_types = [];

function region_triangle(origin_x, origin_y, width, height, type)
{
	if (width != 0 && height != 0)
	{
	regions.triangles[regions.triangles.length] = 
		{
			origin_x: origin_x,
			origin_y: origin_y,
			width: width,
			height: height,
			weight: region_types[type],
			type: type
		};
	}
}

function region_rectangle(bottom_x, bottom_y, width, height, type)
{
	if (width != 0 && height != 0)
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

	regions.rectangles[regions.rectangles.length] = 
		{
			origin_x: bottom_x,
			origin_y: bottom_y,
			width: width,
			height: height,
			weight: region_types[type],
			type: type
		};

	}

}

function region_type (name, weight)
{
	region_types[name] = weight;
}

function region(i, axes) {

axes = ((typeof axes !== 'undefined') ? axes : {left_edge:0, right_edge:0});

// Prelims
regions = {rectangles: [], triangles: []};
region_type('wall', i.wall_weight);

if (i.mode == 'gravity')
{

var back_detail_start = 0;
var front_detail_start = 0;
var footing = 0;

// Standard Parts ----------------------------------------------------------------------
region_rectangle(0, 0, i.total_width, i.base_thickness, 'wall');
region_rectangle(i.toe_length, i.base_thickness, i.stem_thickness, i.stem_height, 'wall');

if (i.shear_key != false)
{
	region_rectangle(i.total_width - i.shear_key_thickness, -i.shear_key_height, i.shear_key_thickness, i.shear_key_height, 'wall');
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
		region_rectangle(i.toe_length + i.stem_thickness, i.base_thickness + a * step_depth, i.heel_length - (a+1) * step_run, step_depth, 'wall');
	}
	back_detail_start = i.base_thickness + a * step_depth;
}
if (i.back_detailing == 'inclined')
{
	chamfer_height = i.stem_height;
	chamfer_width = chamfer_height * Math.tan(i.back_angle);

	region_triangle(i.toe_length + i.stem_thickness, i.base_thickness, chamfer_width, chamfer_height, 'wall');
	back_detail_start = i.base_thickness + chamfer_height;
}
if (i.front_detailing == 'stepped')
{
	step_depth = i.front_step_depth;
	step_run = i.front_step_run;
	steps = i.front_steps;

	for (a = 0; a < steps; a++)
	{
		region_rectangle((a+1) * step_run, i.base_thickness + a * step_depth, i.toe_length - (a+1) * step_run, step_depth, 'wall');
	}
	front_detail_start = i.base_thickness + a * step_depth;
}

if (i.front_detailing == 'inclined')
{
	chamfer_height = i.stem_height;
	chamfer_width = chamfer_height * Math.tan(i.front_angle);

	region_triangle(i.toe_length, i.base_thickness, -chamfer_width, chamfer_height, 'wall');
	front_detail_start = i.base_thickness + chamfer_height;
}
}

// Retaining Soil ------------------------------------------------------------------
var current_depth = i.total_retained + i.base_thickness;
detail_start = back_detail_start;
for (a = 0; a < i.retained.length; a++)
{
	depth = i.retained[a].depth;
	region_type('retained_' + a, i.retained[a].weight);
	region_type('oretained_' + a, 0);
	detail = false;

	if (current_depth > detail_start)
	{
		if ((current_depth - depth) >= detail_start)
		{
			// No detailing to worry about
			region_rectangle(i.toe_length + i.stem_thickness, current_depth - depth, i.heel_length, depth, 'retained_' + a);
		}
		else
		{
			// Transition into detailing
			region_rectangle(i.toe_length + i.stem_thickness, detail_start, i.heel_length, current_depth - detail_start, 'retained_' + a);
			region_rectangle(i.total_width, current_depth - depth, axes.right_edge, depth, 'retained_' + a);

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
		var layer_top = detail_start - current_depth;
		var layer_bot = detail_start - current_depth + depth;
		var detail_width = 0;

		if (i.back_detailing == 'inclined')
		{
			chamfer_height = i.stem_height;
			chamfer_width = chamfer_height * Math.tan(i.back_angle);
			detail_width = chamfer_width;

			x_bot = layer_bot * chamfer_width / chamfer_height;

			region_triangle(i.toe_length + i.stem_thickness + x_bot, detail_start - layer_top, - depth * chamfer_width / chamfer_height, -depth, 'retained_' + a);
			region_rectangle(i.toe_length + i.stem_thickness + x_bot, detail_start - layer_bot, chamfer_width * (1 - depth / chamfer_height), depth, 'retained_' + a);
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
				region_rectangle (i.total_width - i.back_step_run * (i.back_steps - current_step + 1), top_depth, i.back_step_run * (i.back_steps - current_step+ 1), bottom - top_depth, 'retained_' + a);
				
				remaining_depth = remaining_depth - (top_depth - bottom);
				top_depth = bottom;
				current_step = current_step + 1;

			}
			// Draw last part
			region_rectangle(i.total_width - i.back_step_run * (i.back_steps - current_step + 1), top_depth, i.back_step_run * (steps - current_step+1), -remaining_depth, 'retained_' + a);
		}

		// Outside of detail area
		region_rectangle(i.toe_length + i.stem_thickness + detail_width, current_depth - depth, i.heel_length - detail_width, depth, 'retained_' + a);
	}
	region_rectangle(i.total_width, current_depth - depth, axes.right_edge, depth, 'oretained_' + a);

	current_depth = current_depth - depth;
}

// Cover Soil ------------------------------------------------------------------
var current_depth = i.base_thickness + i.total_cover;
footing = 0;
detail_start = front_detail_start;

for (a = 0; a < i.cover.length; a++)
{
	depth = i.cover[a].depth;
	region_type('cover_' + a, i.cover[a].weight);
	region_type('ocover_' + a, 0);

	detail = false;

	if (current_depth > detail_start)
	{
		if ((current_depth - depth) >= detail_start)
		{
			// No detailing to worry about
			if (i.toe_length > 0)
			{
				region_rectangle(0, current_depth - depth, i.toe_length, depth, 'cover_' + a);
			}
		}
		else
		{
			// Transition into detailing
			region_rectangle(0, detail_start, i.toe_length, current_depth - detail_start, 'cover_' + a);
			region_rectangle(0, current_depth - depth, axes.left_edge, depth, 'cover_' + a);

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
		var layer_top = detail_start - current_depth;
		var layer_bot = detail_start - current_depth + depth;
		var detail_width = 0;

		if (i.front_detailing == 'inclined')
		{
			chamfer_height = i.stem_height;
			chamfer_width = chamfer_height * Math.tan(i.front_angle);
			detail_width = chamfer_width;

			x_bot = layer_bot * chamfer_width / chamfer_height;

			region_triangle(i.toe_length - x_bot, detail_start - layer_top, depth * chamfer_width / chamfer_height, -depth, 'cover_' + a);
			region_rectangle(i.toe_length - x_bot, detail_start - layer_bot, -chamfer_width * (1 - depth / chamfer_height), depth, 'cover_' + a);
		}
		else if (i.front_detailing == 'stepped')
		{
			detail_width = i.toe_length;

			current_step = Math.floor(layer_top / i.front_step_depth) + 1;
			remaining_depth = depth;
			top_depth = current_depth;
			while (remaining_depth > i.front_step_depth && current_step <= i.front_steps)
			{				
				bottom = detail_start - current_step * i.front_step_depth;
				region_rectangle(0, top_depth, i.front_step_run * (i.front_steps - current_step+ 1), bottom - top_depth, 'cover_' + a);
				
				remaining_depth = remaining_depth - (top_depth - bottom);
				top_depth = bottom;
				current_step = current_step + 1;

			}
			// Draw last part
			region_rectangle(0, top_depth,step_run * (steps - current_step+1), -remaining_depth, 'cover_' + a);
		}

		// Outside of detail area
		region_rectangle(0, current_depth - depth, i.toe_length - detail_width, depth, 'cover_' + a);
	}

	region_rectangle(0, current_depth - depth, axes.left_edge, depth, 'ocover_' + a);

	current_depth = current_depth - depth;
}


}

// --- Primary drawing functions
// Takes inputs in local coordiante system whereby the toe of the retaining wall is (0,0)
// x is positive right and y is positive up 
// Translates onto drawing coordiante system whereby the origin is in the top left corner
// x is positive right and y is positive down and coordinates are scaled onto a 1200 x1200 palette

function change_base(num, from, to, length)
{
	num = parseInt(num, from);
	var new_num = num.toString(to);
	while (new_num.length < length)
	{
		new_num = "0" + new_num;
	}

	return new_num;
}

var src = '';
var src2 = '';
var colour_types = [];

function colour_type (name, colour)
{
	colour_types[name] = colour;
}

function draw_line (axes, left_x, left_y, right_x, right_y, colour, on2)
{

	if (right_x < left_x)
	{
		var a = left_x;
		left_x = right_x;
		right_x = a;
	}
	if (left_y < right_y)
	{
		var a = left_y;
		left_y = right_y;
		right_y = a;
	}


	var width = Math.floor(axes.scale * (right_x - left_x));
	var height = Math.floor(axes.scale * (left_y - right_y));
	var left_x = Math.floor(axes.o_x + axes.scale * left_x);
	var left_y = Math.floor(axes.o_y - axes.scale * left_y);	

	var append = "l" + change_base(left_x, 10, 36, 4) + "" + change_base(left_y, 10, 36, 4) + "" + change_base(width, 10, 36, 4) + "" + change_base(height, 10, 36, 4) + "" + colour + ";";

	if (typeof on2 === 'undefined')
	{
		src = src + append;
	}
	else
	{
		src2 = src2 + append;
	}
}

function draw_rectangle (axes, bottom_x, bottom_y, width, height, type, on2)
{
	var colour = colour_types[type];
	var min_x = Math.floor(axes.o_x + axes.scale * bottom_x);
	var max_y = Math.floor(axes.o_y - axes.scale * bottom_y);
	var max_x = Math.floor(axes.o_x + axes.scale * (bottom_x + width));
	var min_y = Math.floor(axes.o_y - axes.scale * (bottom_y + height));

	var append = "r" + change_base(min_x, 10, 36, 4) + "" + change_base(min_y, 10, 36, 4) + "" + change_base(Math.abs(max_x - min_x), 10, 36, 4) + "" + change_base(Math.abs(max_y - min_y), 10, 36, 4) + "" + colour + ";";

	if (typeof on2 === 'undefined')
	{
		src = src + append;
	}
	else
	{
		src2 = src2 + append;
	}
}

function draw_triangle(axes, x_1, y_1, width, height, type, on2)
{
	var colour = colour_types[type];
	var describe;
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

	var append = describe + change_base(x_1, 10, 36, 4) + "" + change_base(y_1, 10, 36, 4) + "" + change_base (Math.abs(x_2 - x_1), 10, 36, 4) + "" + change_base(Math.abs(y_2 - y_1), 10, 36, 4) + "" + colour + ";";

	if (typeof on2 === 'undefined')
	{
		src = src + append;
	}
	else
	{
		src2 = src2 + append;
	}
}

function draw_surcharge(axes, x, y, on2)
{
	x = axes.o_x + axes.scale * x;
	y = axes.o_y - axes.scale * y;

	var append = "s" + change_base(x, 10, 36, 4) + "" + change_base(y, 10, 36, 4) + ";";

	if (typeof on2 === 'undefined')
	{
		src = src + append;
	}
	else
	{
		src2 = src2 + append;
	}
}

function draw_arrow(axes, x_1, y_1, left_or_right, up_or_down, on2)
{
	x_1 = axes.o_x + axes.scale * x_1;
	y_1 = axes.o_y - axes.scale * y_1;

	var length = 100;
	var x_2 = x_1 + left_or_right * length;
	var y_2 = y_1 - up_or_down * length;

	append = "p" + change_base(x_1, 10, 36, 4) + "" + change_base(y_1, 10, 36, 4) + change_base(x_2, 10, 36, 4) + change_base(y_2, 10, 36, 4) + ";";

	if (typeof on2 === 'undefined')
	{
		src = src + append;
	}
	else
	{
		src2 = src2 + append;
	}
}

function draw_dim(axes, p_1, p_2, edge, label, on1)
{
	var layer = Math.floor(edge / 4);
	var edge = edge % 4;

	var clear = layer * 50 + 25;

	var x_1, x_2, y_1, y_2;
	if (edge == 1 || edge == 3)
	{
		// Left or right
		y_1 = axes.o_y - p_1 * axes.scale;
		y_2 = axes.o_y - p_2 * axes.scale;	

		// RHS
		if (edge == 1)
		{
			x_1 = 1200 - axes.o_x + clear;
			x_2 = x_1;
		}
		else
		{
			x_1 = 0 + axes.o_x - clear;
			x_2 = x_1;
		}
	}
	if (edge == 2 || edge == 0)
	{
		// Top or bottom
		x_1 = axes.o_x + p_1 * axes.scale;
		x_2 = axes.o_x + p_2 * axes.scale;	

		// Bottom
		if (edge == 2)
		{
			y_1 = 0 + axes.o_y + clear;
			y_2 = y_1;
		}
		else
		{
			y_1 = 1200 - axes.o_y - clear;
			y_2 = y_1;
		}
	}

	append = "m" + change_base(x_1, 10, 36, 4) + "" + change_base(y_1, 10, 36, 4) + "" + change_base(x_2, 10, 36, 4) + "" + change_base(y_2, 10, 36, 4) + "" + edge + "" + label + ";";

	if (typeof on1 !== 'undefined')
	{
		src = src + append;
	}
	else
	{
		src2 = src2 + append;
	}
}

var distributions = [];
function add_distrib(distrib)
{
	distributions[distrib] = {low_y: 0, high_y: 0, max_x: 0, min_x: 0}
	distributions[distrib].points = [];
}

function add_point(distrib, x, y)
{
	if (y < distributions[distrib].low_y)
	{
		distributions[distrib].low_y = y;
	}
	else if (y > distributions[distrib].high_y)
	{
		distributions[distrib].high_y = y;
	}
	if (x >= 0)
	{
		if (x > distributions[distrib].max_x)
		{
			distributions[distrib].max_x = x;
		}
	}
	else
	{
		if (x < distributions[distrib].min_x)
		{
			distributions[distrib].min_x = x;
		}
	}	

	distributions[distrib].points.push(x, y);
}

function draw_text(axes, x, y, align, text, colour)
{
	//	0	1	2
	//	3	4	5
	//	6	7	8

	x = axes.o_x + axes.scale * x;
	y = axes.o_y - axes.scale * y;

	src2 = src2 + "t" + change_base(x, 10, 36,4) + "" + change_base(y, 10, 36,4) + "" + align + "" + colour + "" + text + ";";
}

function draw_distrib(axes, distribs, colour)
{
	var a,b;
	var scale = 0;
	for (a = 0; a < distribs.length; a++)
	{	
		if (Math.abs(distributions[distribs[a]].min_x) > scale)
		{
			scale = Math.abs(distributions[distribs[a]].min_x);
		}
		if (Math.abs(distributions[distribs[a]].max_x) > scale)
		{
			scale = Math.abs(distributions[distribs[a]].max_x);
		}
	}
	scale = ((scale == 0) ? 1 : scale);

	for (a = 0; a < distribs.length; a++)
	{
	src2 = src2 + "g" + colour[a] + change_base(axes.o_x, 10, 36, 4) + change_base(axes.o_y - axes.scale * distributions[distribs[a]].high_y, 10, 36, 4);
	for (b = 0; b < distributions[distribs[a]].points.length; b++)
	{
		var x = (((b % 2) == 0) ? axes.o_x + 500 * distributions[distribs[a]].points[b] / scale : axes.o_y - axes.scale * distributions[distribs[a]].points[b]);
		x = Math.round(x);
		src2 = src2 + change_base(x, 10, 36, 4);
	}
	src2 = src2 + change_base(axes.o_x, 10, 36, 4) + change_base(axes.o_y - axes.scale * distributions[distribs[a]].low_y, 10, 36, 4);
	src2 = src2 + ";";

	for (b = 0; b < distributions[distribs[a]].points.length; b++)
	{
		var z = (((b % 2) == 0) ? 500 * distributions[distribs[a]].points[b] / scale / axes.scale : distributions[distribs[a]].points[b]);
		if ((b % 2) == 1)
		{
			var y = z;
			draw_text(axes, x, y, ((x == 0) ? 7 : ((x < 0) ? 5 : 3)), process(distributions[distribs[a]].points[b-1]), colour[a]);
		}
		else
		{
			var x = z;
		}
	}
	}
}

function draw_measurements ()
{
	var i = get_inputs();
	var axes = new_axes(i);
	src2 = '';

	if (i.mode == 'gravity')
	{
		if (i.stem_height > i.total_retained)
		{
			draw_dim(axes, i.stem_height + i.base_thickness, i.total_retained + i.base_thickness, 1, i.stem_height - i.total_retained);
		}

		draw_dim(axes, 0, i.toe_length, 2, i.toe_length);
		draw_dim(axes, i.toe_length + i.stem_thickness, i.total_width, 2, i.heel_length);
		draw_dim(axes, 0, i.base_thickness, 3, Math.abs(i.base_thickness));
		draw_dim(axes, i.toe_length, i.toe_length + i.stem_thickness, 2, i.stem_thickness);

		if (i.shear_key)
		{
			draw_dim(axes, 0, -i.shear_key_height, 1, i.shear_key_height);
			draw_dim(axes, i.total_width, i.total_width - i.shear_key_thickness, 6, i.shear_key_thickness);
		}

		if (i.back_detailing == 'inclined')
		{
			draw_dim(axes, i.toe_length + i.stem_thickness, i.toe_length + i.stem_thickness + i.stem_height * Math.tan(i.back_angle), 0, process(i.stem_height * Math.tan(i.back_angle)));
		}
		if (i.front_detailing == 'inclined')
		{
			draw_dim(axes, i.toe_length, i.toe_length - i.stem_height * Math.tan(i.front_angle), 0, process(i.stem_height * Math.tan(i.front_angle)));
		}
	}
	else if (i.mode == 'sheet')
	{
		if (i.sheet_height > i.total_retained)
		{
			draw_dim(axes, i.sheet_height, i.total_retained, 1, i.sheet_height - i.total_retained);
		}
	}

	var a;
	var top = ((i.mode == 'sheet') ? 0 : i.base_thickness);
	top = top + i.total_retained;
	for (a = 0; a < i.retained.length; a++)
	{
		draw_dim(axes, top, top - i.retained[a].depth, 1, i.retained[a].depth);
		top = top - i.retained[a].depth;
	}

	var top = ((i.mode == 'sheet') ? 0 : i.base_thickness);
	top = top + i.total_cover;
	for (a = 0; a < i.cover.length; a++)
	{
		draw_dim(axes, top, top - i.cover[a].depth, 3, i.cover[a].depth);
		top = top - i.cover[a].depth;
	}
	
	draw_graph();
}

function draw_blocks()
{
src2 = '';
var i = get_inputs();
var axes = new_axes(i);
var shapes = ['rectangles', 'triangles'];
var a, b;
var count = 0;
for (b = 0; b < 2; b++)
{

for (a = 0; a < regions[shapes[b]].length; a++)
{
	var me = regions[shapes[b]][a];
	var type = '';

	if (me.weight > 0)
	{
	var colour = "00AA00";
	draw_text(axes, me.origin_x + me.width / 2, me.origin_y + me.height / 2, 4, change_base(count+10, 10, 36), colour);
	if (b == 0)
	{
	draw_line(axes, me.origin_x, me.origin_y, me.origin_x + me.width, me.origin_y, colour, true);
	draw_line(axes, me.origin_x+me.width, me.origin_y, me.origin_x + me.width, me.origin_y+me.height, colour, true);
	draw_line(axes, me.origin_x, me.origin_y+me.height, me.origin_x + me.width, me.origin_y+me.height, colour, true);
	draw_line(axes, me.origin_x, me.origin_y, me.origin_x, me.origin_y+me.height, colour, true);
	}
	count = count + 1;
}}}

draw_graph();
}

function draw_graph(img)
{
	if (typeof img === 'undefined')
	{
		img = 'graph';
	}
	$("#" + img).attr("src", "canvas.php?" + src2);
}

// --- Set palette up ----------------------------------------------
function resize()
{
	var width = $(window).width() * 0.3;
	var height = $(window).height() * 0.8;
	if (width < height)
	{
		$("#preview").css("height", width + "px");
		$("#preview").css("width", width + "px");
		$("#graph").css("height", width + "px");
		$("#graph").css("width", width + "px");
	}
	else
	{
		$("#preview").css("width", height + "px");
		$("#preview").css("height", height + "px");
		$("#graph").css("height", height + "px");
		$("#graph").css("width", height + "px");
	}	

}

function new_axes(i)
{
	var box_x = 1200;
	var box_y = 1200;
	var x_margin = 100;
	var y_margin = 100;
	var inner_x = box_x - 2 * x_margin;
	var inner_y = box_y - 2 * y_margin;

	var axes = {scale: 0, o_x: 0, o_y: 0, left_edge: 0, right_edge: 0};
	var surchage = ((i.surcharge > 0) ? 40 : 0);

	if ((inner_y / i.total_height) < (inner_x / i.total_width) || i.mode == 'sheet')
	{
		axes.scale = inner_y / i.total_height;
		if (i.shear_key !== true)
		{
			i.shear_key_height = 0;
		}
		axes.o_y = box_y - y_margin - axes.scale * i.shear_key_height;
		axes.o_x = x_margin + (inner_x - axes.scale * i.total_width) / 2;
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
	
	return axes;
}

function graph_switch()
{
	var i = get_inputs();
	src2 = '';
	if (i.mode != 'sheet')
	{
		redraw('preview', 'sheet');
		i.mode = 'sheet';
		i.total_width = 0;
		i.base_thickness = 0;
		i.sheet_height = i.stem_height;

	}
	return new_axes(i);
}

function redraw(mode)
{
	src = '';

	var i = get_inputs();
	if (typeof mode !== 'undefined') 
	{
		i.mode = 'sheet';
		i.sheet_height = i.stem_height;
		i.total_width = 0;
		i.stem_thickness = 0 ;
		i.base_thickness = 0;
		i.heel_length = 0;
		i.toe_length = 0;
		i.front_detailing = 'none';
		i.back_detailing = 'none';
		i.shear_key = false;
	}

	var axes = new_axes(i);
	if (typeof mode !== 'undefined') 
	{
		axes.o_y = axes.o_y;
		i.sheet_height = i.stem_height;
	}
	// Get regions ------------------------------------------------------------------
	region(i, axes);

	// Set colours
	var colour;
	var colourHEX;
	var a;

	colour_type('wall', '444444');
	for (a = 0; a < i.retained.length; a++)
	{
		colour = Math.round((1 - ((a+1) % 25) / 25) * 256) * 256 * 256 + Math.round((1 - ((a+1) % 5) / 5) * 256) * 256;
		colourHEX = colour.toString(16);
		colour_type('retained_' + a, colourHEX);
		colour_type('oretained_' + a, colourHEX);
	}
	for (a = 0; a < i.cover.length; a++)
	{
		colour = Math.round((1 - ((a+1) % 25) / 25) * 256) * 256 * 256 + Math.round((1 - ((a+1) % 5) / 5) * 256) * 256;
		colourHEX = colour.toString(16);		
		colour_type('cover_' + a, colourHEX);
		colour_type('ocover_' + a, colourHEX);
	}

	// Let's draw
	for (a = 0; a < regions.rectangles.length; a++)
	{
		me = regions.rectangles[a];
		draw_rectangle(axes, me.origin_x, me.origin_y, me.width, me.height, me.type)
	}
	for (a = 0; a < regions.triangles.length; a++)
	{
		me = regions.triangles[a];
		draw_triangle(axes, me.origin_x, me.origin_y, me.width, me.height, me.type)
	}

	// Water Table ------------------------------------------------------------------
	var detail;
	var y;
	var water = '0000FF';
	if (i.check_inside)
	{
		detail = 0;
		y = i.water_inside + i.base_thickness;
		if (y <= i.base_thickness)
		{
			detail = i.toe_length;
		}
		else if (i.front_detailing == 'inclined')
		{
			detail = (i.stem_height - (y - i.stem_thickness)) * Math.tan(i.front_angle);
		}
		else if (i.front_detailing == 'stepped')
		{
			var step_depth = i.front_step_depth;
			var step_no = Math.ceil((y - i.stem_thickness) / step_depth);
			if (step_no <= i.front_steps)
			{
				detail = i.toe_length - step_no * i.front_step_run;
			}
		}
		draw_line(axes, axes.left_edge, y, i.toe_length - detail, y, water);
	}

	if (i.check_under)
	{
		draw_line(axes, 0, i.water_under, i.total_width, i.water_under, water);
	}

	if (i.check_outside)
	{
		detail = 0;
		y = i.water_outside + i.base_thickness;
		if (y <= i.base_thickness)
		{
			detail = i.heel_length;
		}
		else if (i.back_detailing == 'inclined')
		{
			detail = (i.stem_height - (y - i.stem_thickness)) * Math.tan(i.back_angle);
		}
		else if (i.back_detailing == 'stepped')
		{
			var step_depth = i.back_step_depth;
			var step_no = Math.ceil((y - i.stem_thickness) / step_depth);
			if (step_no <= i.back_steps)
			{
				detail = i.heel_length - step_no * i.back_step_run;
			}
		}

		draw_line(axes, i.stem_thickness + i.toe_length + detail, y, i.total_width + axes.right_edge, y, water);
	}

	// Surcharge ------------------------------------------------------------------
	if (i.surcharge > 0)
	{
		draw_surcharge(axes, i.stem_thickness + i.toe_length, i.total_retained + i.base_thickness);
	}

	// Forces ---------------------------------------------------------------------

	for (a = 0; a < i.force.length; a++)
	{
		if (i.force[a].dir_x != 0)
		{
			var dir_x = i.force[a].dir_x / Math.abs(i.force[a].dir_x);
			draw_arrow(axes, i.force[a].pos_x, i.force[a].pos_y, dir_x, 0);
		}
		
		if (i.force[a].dir_y != 0)
		{
			var dir_y = i.force[a].dir_y / Math.abs(i.force[a].dir_y);
			draw_arrow(axes, i.force[a].pos_x, i.force[a].pos_y, 0, dir_y);
		}
	}

	if (i.mode == 'sheet')
	{
		draw_line(axes, 0, 0, 0, i.sheet_height, colour_types['wall']);
	}

	if (typeof mode !== 'undefined') 
	{
		i.mode = mode;
	}

	$("#preview").attr("src", "canvas.php?" + src);
}