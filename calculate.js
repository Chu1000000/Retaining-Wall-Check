function process(val, abs)
{
	var sf = 3;
	var a;

	val_abs = Math.abs(val);
	val_abs = val_abs.toPrecision(sf);
	var str = val_abs.toString();
	if (str.indexOf("e") >= 0)
	{
		var decimel = str.indexOf(".");
		var power = parseInt(str.substr(str.indexOf("e") + 2, str.length - str.indexOf("e") - 2));

		if (decimel >= 0)
		{
			diff = str.indexOf("e") - decimel - 1;
			str = str.substr(0, decimel) + str.substr(decimel + 1, diff);
		}
		else
		{
			str = str.substr(0, str.indexOf("e"));
		}

		for (a = diff; a < power; a++)
		{
			str = str + "0";
		}
	}
	var processed = '';
	if (power >= 3)
	{
		var bands = Math.floor(str.length / 3);
		var excess = str.length % 3;
		processed = str.substr(0, excess);
		for (a = 0; a < bands; a++)
		{
			if (processed != '')
			{
				processed = processed + ",";
			}
			processed = processed + str.substr(excess + a *3, 3);
		}
	}
	else
	{
		processed = str;
	}

	if (abs == false && val < 0)
	{
		processed = '-' + processed;
	}
	return processed;
}

function calculate()
{
i = get_inputs();
region(i);

var p_force = 1;
var n_force = 1.35;

$("#wall_areas").html("");
$("#soil_areas").html("");
$("#v_forces").html("");

$("#s_retained").html("");
$("#s_cover").html("");

$("#h_fav").html("");
$("#h_unfav").html("");
$("#h_retained").html("");
$("#h_cover").html("");

$("#v_moments").html("");
$("#v_wall_moments").html("");
$("#v_soil_moments").html("");
$("#h_moments").html("");
$("#m_retained").html("");
$("#m_cover").html("");

$("#v_moments_e").html("");
$("#v_wall_moments_e").html("");
$("#v_soil_moments_e").html("");

var v1 = 0;
var v2 = 0;
var m1 = [];
var m2 = [];
m1.unfav = 0;
m1.fav = 0;
m2.unfav = 0;
m2.fav = 0;
var count = 0;
var m1_e = 0;
var m2_e = 0;
var h1 = [];
var h2 = [];
h1.unfav = 0;
h1.fav = 0;
h2.unfav = 0;
h2.fav = 0;

// Regions ------------------------------------------------------------------------
var shapes = ['rectangles', 'triangles'];
var a, b, c, d;
for (b = 0; b < 2; b++)
{

for (a = 0; a < regions[shapes[b]].length; a++)
{
	var me = regions[shapes[b]][a];
	var type = '';

	if (me.weight > 0)
	{
	
	if (me.type == 'wall')
	{
		type = 'wall';
		me.name = 'Wall';
	}
	else
	{
		type = 'soil';
		if (me.type.substr(0, 1) == 'r')
		{
			id = me.type.substr(9, me.type.length - 9);
			me.name = i.retained[parseInt(id)].name;
		}
		else if (me.type.substr(0,1) == 'c')
		{
			id = me.type.substr(6, me.type.length - 6);
			me.name = i.cover[parseInt(id)].name;
		}
	}

	var shape = '';

	me.area = Math.abs(me.width * me.height);
	if (b == 0)
	{
		shape = 'Rec';
		arm = 0.5;
	}
	else
	{
		shape = 'Tri';
		arm = 1/3;
		me.area = me.area/2;
	}

	me.v2 = - me.area * me.weight;
	me.v1 = me.v2 * n_force;
	v1 = v1 + me.v1;
	v2 = v2 + me.v2;

	var m_f;
	var m_fe;

	me.arm_v = (0 - (me.origin_x + arm * me.width));
	if ((me.v2 * me.arm_v) <= 0)
	{
		m_f = n_force;
	}
	else
	{
		m_f = p_force;
	}

	me.m2 = me.arm_v * me.v2;
	me.m1 = me.m2 * m_f;
	if (me.m1 < 0)
	{
		m1.unfav = m1.unfav + me.m1;
	}
	else
	{
		m1.fav = m1.fav + me.m1;
	}
	if (me.m2 < 0)
	{
		m2.unfav = m2.unfav + me.m2;
	}
	else
	{
		m2.fav = m2.fav + me.m2;
	}
	
	me.arm_ve = (i.total_width/2 - (me.origin_x + arm * me.width));
	if ((me.v2 * me.arm_ve) <= 0)
	{
		m_fe = n_force;
	}
	else
	{
		m_fe = p_force;
	}

	me.m2e = me.arm_ve * me.v2;
	me.m1e = me.m2e * m_fe;
	m1_e = m1_e + me.m1e;
	m2_e = m2_e + me.m2e;

	$("#" + type + "_areas").append("<tr><td>" + change_base(count+10, 10,36) + " = <i>" + shape + "<i>" + "</td><td>" + process(me.width) + "</td><td>" + process(me.height) + "</td><td>" + process(me.area) + "</td><td>" + process(me.weight) + "</td><td>" + process(me.v2, false) + "</td><td colspan='2'></td><td>" + n_force + "</td><td>"  + process(me.v1, false) + "</td></tr>");
	$("#v_"+ type + "_moments").append("<tr><td colspan='3'>" + change_base(count+10, 10,36) + " - <i>" + me.name+ "</i></td><td>" + process(me.v2, false) + "</td><td>" + process(me.arm_v, false) + "</td><td>" + process(me.m2, false) + "</td><td colspan='2'></td><td>" + process(m_f, false) + "</td><td>" + process(me.m1, false) + "</td></tr>");
	$("#v_"+ type + "_moments_e").append("<tr><td colspan='3'>" + change_base(count+10, 10,36) + " <i>" + me.name+ "</i></td><td>" + process(me.v2, false) + "</td><td>" + process(me.arm_ve, false) + "</td><td>" + process(me.m2e, false) + "</td><td colspan='2'></td><td>" + process(m_fe, false) + "</td><td>" + process(me.m1e, false) + "</td></tr>");
	regions[shapes[b]][a] = me;
	count = count + 1;
	}
}
}

// Surcharge ---------------------------------------------------
var surcharge = i.surcharge;
var factor;
var m_factor;

if (surcharge >= 0)
{
	factor = n_force;
	m_factor = p_force;
}
else
{
	factor = p_force;
	m_factor = n_force;
}

var vertical = surcharge * i.heel_length;
v1 = v1 + vertical * factor;
v2 = v2 + vertical;

var arm = 0 - (i.total_width - i.heel_length / 2);
var moment = vertical * arm;
m1.fav = m1.fav + moment * m_factor;
m2.fav = m2.fav + moment;

var arme = i.total_width/2 - (i.total_width - i.heel_length / 2);
var momente = vertical * arme;
m_factore = (((surcharge * arme) < 0) ? n_force : p_force);
m1_e = m1_e + moment * m_factore;
m2_e = m2_e + moment;

$("#v_forces").append("<tr><td colspan='5'>Surcharge</td><td>" + process(vertical, false) + "</td><td colspan='2'></td><td>" + process(factor, false) + "</td><td>" + process(vertical * factor, false))
$("#v_moments").append("<tr><td colspan='3'>Surcharge</td><td>" + process(vertical, false) + "</td><td>" + process(arm, false) + "</td><td>" + process(moment, false) + "</td><td colspan='2'></td><td>" + process(m_factor, false) + "</td><td>" + process(moment * m_factor, false) + "</td></tr>");
$("#v_moments_e").append("<tr><td colspan='3'>Surcharge</td><td>" + process(vertical, false) + "</td><td>" + process(arme, false) + "</td><td>" + process(momente, false) + "</td><td colspan='2'></td><td>" + process(m_factore, false) + "</td><td>" + process(moment * m_factore, false) + "</td></tr>");

// Forces ------------------------------------------------------
for (a = 0; a < i.force.length; a++)
{
	me = i.force[a];

	if (me.pos_x >= 0 && me.pos_x <= i.total_width)
	{
		me.v2 = me.dir_y;
		if (me.v2 >= 0)
		{
			factor = p_force;
		}
		else
		{
			factor = n_force;
		}
		me.v1 = me.v2 * factor;

		var m_f;
		var m_fe;

		me.arm_v = (0 - me.pos_x);
		if ((me.v2 * me.arm_v) <= 0)
		{
			m_f = n_force;
		}
		else
		{
			m_f = p_force;
		}

		me.mv2 = me.arm_v * me.v2;
		me.mv1 = me.mv2 * m_f;
		
		if (me.mv1 < 0)
		{
			m1.unfav = m1.unfav + me.mv1;
		}
		else
		{
			m1.fav = m1.fav + me.mv1;
		}
		if (me.mv2 < 0)
		{
			m2.unfav = m2.unfav + me.mv2;
		}
		else
		{
			m2.fav = m2.fav + me.mv2;
		}
	
		me.arm_ve = (i.total_width/2 - me.pos_x);
		if ((me.v2 * me.arm_ve) <= 0)
		{
			m_fe = n_force;
		}
		else
		{
			m_fe = p_force;
		}

		me.mv2e = me.arm_ve * me.v2;
		me.mv1e = me.mv2e * m_fe;

		m1_e = m1_e + me.mv1e;
		m2_e = m2_e + me.mv2e;

		$("#v_forces").append("<tr><td colspan='5'>Force-" + (a+1) + "</td><td>" + process(me.v2, false) + "</td><td colspan='2'></td><td>" + factor + "</td><td>" + process(me.v1, false) + "</td></tr>");
		$("#v_moments").append("<tr><td colspan='3'>Force-" + (a+1) + "</td><td>" + process(me.v2, false) + "</td><td>" + process(me.arm_v, false) + "</td><td>" + process(me.mv2, false) + "</td><td colspan='2'></td><td>" + process(m_f, false) + "</td><td>" + process(me.mv1, false) + "</td></tr>");
		$("#v_moments_e").append("<tr><td colspan='3'>Force-" + (a+1) + "</td><td>" + process(me.v2, false) + "</td><td>" + process(me.arm_ve, false) + "</td><td>" + process(me.mv2e, false) + "</td><td colspan='2'></td><td>" + process(m_fe, false) + "</td><td>" + process(me.mv1e, false) + "</td></tr>");
	}
	else
	{
		$("#v_forces").append("<tr><td colspan='7'>Force-" + (a+1) + "</td><td colspan='3'>Out of influence zone</td></tr>");
		me.v2 = 0;
		me.v1 = 0;
	}

	v1 = v1 + me.v1;
	v2 = v2 + me.v2;

	//----------
	var bot;
	if (i.shear_key)
	{
		bot = -i.shear_key_height;
	}
	else
	{
		bot = 0;
	}

	if (me.pos_y >= bot && me.pos_y <= i.total_height - bot)
	{
		me.h2 = me.dir_x;
		if (me.h2 >= 0)
		{
			factor = p_force;
			desc = 'fav';
		}
		else
		{
			factor = n_force;
			desc = 'unfav';
		}
		me.h1 = me.h2 * factor;

		var m_f;

		me.arm_h = me.pos_y;
		if ((me.h2 * me.arm_h) <= 0)
		{
			m_f = n_force;
		}
		else
		{
			m_f = p_force;
		}

		me.mh2 = me.arm_h * me.h2;
		me.mh1 = me.mh2 * m_f;

		if (me.mh1 <= 0)
		{
			m1.unfav = m1.unfav + me.mh1;
		}
		else
		{
			m1.fav = m1.fav + me.mh1;
		}
		if (me.mh2 <= 0)
		{
			m2.unfav = m2.unfav + me.mh2;
		}
		else
		{
			m2.fav = m2.fav + me.mh2;
		}

		$("#h_" + desc).append("<tr><td colspan='5'>Force-" + (a+1) + "</td><td>" + process(me.h2, false) + "</td><td colspan='2'></td><td>" + factor + "</td><td>" + process(me.h1, false) + "</td></tr>");
		$("#h_moments").append("<tr><td colspan='3'>Force-" + (a+1) + "</td><td>" + process(me.h2, false) + "</td><td>" + process(me.arm_h, false) + "</td><td>" + process(me.mh2, false) + "</td><td colspan='2'></td><td>" + process(m_f, false) + "</td><td>" + process(me.mh1, false) + "</td></tr>");

		h1[desc] = h1[desc] + me.h1;
		h2[desc] = h2[desc] + me.h2;
	}
	else
	{
		me.h2 = 0;
		me.h1 = 0;
	}

	i.force[a] = me;
}

for (a = 0; a < 2; a++)
{
	var c_depth = 0;
	var Sv =((a == 0) ? i.surcharge : 0);
	var desc = ((a == 0) ? 'retained' : 'cover');
	var factor = ((a == 0) ? n_force : p_force);
	var table;
	var store;
	var store2;

	add_distrib('v_' + desc);
	add_distrib('h_1' + desc);
	add_distrib('h_2' + desc);
	add_distrib('ve_' + desc);
	add_distrib('he_1' + desc);
	add_distrib('he_2' + desc);

	add_point('v_'+ desc, Sv, i['total_' + desc] - c_depth);
	add_point('ve_'+ desc, Sv, i['total_' + desc] - c_depth);

	if (i.check_outside && a == 0)
	{
		table = i['total_' + desc] + i.base_thickness - i.water_outside;
	}
	else if (i.check_inside && a == 1)
	{
		table = i['total_' + desc] + i.base_thickness - i.water_inside;
	}
	else
	{
		table = i['total_' + desc] + i.base_thickness;
	}

	for (b = 0; b < i[desc].length; b++)
	{
		var me = i[desc][b];
		var o = me.angle * Math.PI / 180;
		var o2 = o / 1.25;

		if (a == 0)
		{
			if (i.soil_coefficient == 'a')
			{
				var K = (1-Math.sin(o))/(1+Math.sin(o));
				var K2 = (1-Math.sin(o2))/(1+Math.sin(o2));
			}
			else
			{
				var K = (1 - Math.sin(o));
				var K2 = (1 - Math.sin(o2));
			}
		}
		else
		{
			var K = (1+Math.sin(o))/(1-Math.sin(o));
			var K2 = (1+Math.sin(o2))/(1-Math.sin(o2));
		}


		for (c = 0; c < 2; c++)
		{
			c_depth = ((c == 1) ? c_depth + me.depth : c_depth);
			label = ((c==0) ? 'Top' : 'Bot');
			Sv = ((c == 1) ? Sv + me.depth * me.weight : Sv);
			var u = ((c_depth > table) ? 9.81 * (c_depth - table) : 0);
			var Sve = Sv - u;
			var She1 = Sve * K;
			var She2 = Sve * K2;
			var F1 = ((c==0) ? '' : Sh1);
			var F2 = ((c==0) ? '' : Sh2);
			var Sh1 = She1 + u;
			var Sh2 = She2 + u;
			var point = 0;
			if (c == 1)
			{
				point = ((a == 0) ? Sv : -Sv);
				add_point("v_" + desc, point, i['total_' +desc] - c_depth);
	
				point = ((a == 0) ? Sve : -Sve);
				add_point("ve_" + desc, point, i['total_' +desc] - c_depth);
			}
			
			point = ((a == 0) ? Sh1 : -Sh1);
			add_point('h_1'+ desc, point, i['total_' + desc] - c_depth);

			point = ((a == 0) ? She1 : -She1);
			add_point('he_1'+ desc, point, i['total_' + desc] - c_depth);

			point = ((a == 0) ? Sh2 : -Sh2);	
			add_point('h_2'+ desc, point, i['total_' + desc] - c_depth);

			point = ((a == 0) ? She2 : -She2);
			add_point('he_2'+ desc, point, i['total_' + desc] - c_depth);

			if (c == 0)
			{
				store = "<tr><td colspan='4'>" + me.name + "</td><td>" + process(Sv) + "</td><td>" + process(me.weight) + "</td><td>" + process(me.depth) + "</td>";
			}
			else
			{
				$("#s_" + desc).append(store + "<td>" + process(Sv) + "</td><td>" + process(u) + "</td><td>" + process(Sve) + "</td></tr>");
			}

			if (c == 1)
			{
				store = "<tr><td>" + desc + "-" + me.name + "</td><td>" + me.depth + "</td><td>" + process(F2, false) + "</td>";
				store2 = "<td>" + process(F1, false) + "</td>";
			}

			if (c == 1)
			{
				var arm1 = (2 * F1 + Sh1) * me.depth / ( 3 * (F1 + Sh1)) + i['total_' + desc] - c_depth;
				var arm2 = (2 * F1 + Sh1) * me.depth / ( 3 * (F1 + Sh1)) + i['total_' + desc] - c_depth;

				F1 = (F1 + Sh1) * me.depth / 2 * factor;
				F2 = (F2 + Sh2) * me.depth / 2;

				if (a == 0)
				{
					F1 = -F1;
					F2 = -F2;
					h1.unfav = h1.unfav + F1;
					h2.unfav = h2.unfav + F2;
				}
				else
				{
					h1.fav = h1.fav + F1;
					h2.fav = h2.fav + F2;
				}

				$("#m_" + desc).append(store + "<td>" + process(Sh2, false) + "</td><td>" + process(arm2) + "</td><td>" + process(arm2 * F2, false) + "</td>" + store2 + "<td>" + process(Sh1, false) + "</td><td>" + process(arm1) + "</td><td>" + process(arm1 * F1, false))

				if (arm1 * F1 < 0)
				{
					m1.unfav = m1.unfav + arm1 * F1;
				}
				else
				{
					m1.fav = m1.fav + arm1 * F1;
				}
				if (arm2 * F2 < 0)
				{
					m2.unfav = m2.unfav + arm2 * F2;
				}
				else
				{
					m2.fav = m2.fav + arm2 * F2;
				}

				m1_e = m1_e + arm1 * F1;
				m2_e = m2_e + arm2 * F2;

				F1 = process(F1);
				F2 = process(F2);
			}

			$("#h_" + desc).append("<tr><td>" + me.name + " (" + label + ")</td><td>" + process(Sve) + "</td><td>" + process(K2) + "</td><td>" + process(She2) + "</td><td>" + process(Sh2) + "</td><td>" + F2 + "</td><td>"  + process(K) + "</td><td>" + process(She1) + "</td><td>" + process(Sh1) + "</td><td>" + F1 + "</td></tr>");
		}
	}
}

var fails = 0;

if (i.mode == 'gravity')
{

var factors = ['', 'n', 's', 'i', 'h'];
var pressure = ['c', 'q', 'g'];
var t = [];

for (a = 0; a < 2; a++)
{
// Drained/Undrained
	var desc = ((a == 0) ? 'd' : 'u');

	for (b = 1; b <= 2; b++)
	{
	// Combination 1/2

		var o = ((a == 0) ? ((b == 1) ? i.bearing_angle : i.bearing_angle / 1.25) : 0);
		o = o * Math.PI / 180;
		var e = ((b == 1) ? Math.abs(m1_e / v1) : Math.abs(m2_e / v2));
		var V = ((b == 1) ? Math.abs(v1) : Math.abs(v2));
		// var H = ((b == 1) ? Math.abs(h1.fav - h1.unfav) : Math.abs(h2.fav - h2.unfav));
		var H = 0;
		var h = i.total_cover;
		var B = i.total_width - 2 * e;
		var L = i.wall_depth;
		var A = B * L;
		var c = ((a == 0) ? 0 : i.bearing_strength);
		t[desc + '_c' + b] = c;
		t[desc + '_q' + b] = ((b == 1) ? i.surcharge / p_force : i.surcharge);
		t[desc + '_g' + b] = ((a == 0) ? 0.5 * (i.bearing_wet_weight - 9.81) * B: 0);

		t[desc + '_nq' + b] = Math.pow(Math.tan(Math.PI / 4 + o/2), 2) * Math.exp(Math.PI * Math.tan(o));
		t[desc + '_nc' + b] = ((a == 0) ? (t[desc + '_nq' + b] - 1) / Math.tan(o) : 2 + Math.PI);
		t[desc + '_ng' + b] = 2 * (t[desc + '_nq' + b] + 1) * Math.tan(o);
		
		t[desc + '_sc' + b] = 1 + B / L * t[desc + '_nq' + b] / t[desc + '_nc' + b];
		t[desc + '_sq' + b] = 1 + B / L * Math.tan(o);
		t[desc + '_sg' + b] = 1 - 0.4 * B / L;

		var temp = ((a == 0) ? (1 - H / (V + A * c / Math.tan(o))) : 1);
		t[desc + '_iq' + b] = Math.pow(temp, 2);
		t[desc + '_ig' + b] = Math.pow(temp, 3);
		t[desc + '_ic' + b] = ((a == 0) ? (Math.pow(temp, 2) - (1 - Math.pow(temp,2)) / (t[desc + '_nc' + b] * Math.tan(o))) : 1 - 2 * H / (A * c * t[desc + '_nc' + b]));

		temp = (((h / B) < 1) ? (h / B) : Math.atan(h / B));
		t[desc + '_hg' + b] = 1;
		t[desc + '_hq' + b] = 1 + 2 * Math.tan(o) * Math.pow(1 - Math.sin(o), 2) * temp;
		t[desc + '_hc' + b] = 1 + 0.4 * temp;

		// Throw back to HTML
		var sum = 0;
		for (c = 0; c < pressure.length; c++)
		{
			var product = 1;
			for (d = 0; d < factors.length; d++)
			{
				$("#t" + desc + "_" + factors[d] + pressure[c] + b).html(process(t[desc + "_" + factors[d] + pressure[c] + b]));

				product = product * t[desc + "_" + factors[d] + pressure[c] + b];
			}
			$("#t" + desc + "_p" + pressure[c] + b).html(process(product));
			sum = sum + Math.abs(product);
		}
		$("#t" + desc + "_cap" + b).html(process(sum));

		var toe = V / (i.total_width * L) * (1 + e * 6 / i.total_width);
		$("#toe_pressure_" + b).html(process(toe));
		var text = ((toe <= sum) ? ' [Safe]' : ' [Unsafe]');
		fails = ((toe <= sum) ? fails : fails + 1);
		$("#max_" + desc + "_" + b).html(process(sum) + text);
	}
}

}

var text='';

$("#v1").html(process(v1,false));
$("#v2").html(process(v2, false));
$("#m1_fav").html(process(m1.fav,false));
$("#m2_fav").html(process(m2.fav, false));
$("#m1_unfav").html(process(m1.unfav,false));
$("#m2_unfav").html(process(m2.unfav, false));
$("#uh1").html(process(h1.unfav, false));
$("#uh2").html(process(h2.unfav, false));
$("#fh1").html(process(h1.fav, false));
$("#fh2").html(process(h2.fav, false));
$("#m1_e").html(process(m1_e, false));
$("#m2_e").html(process(m2_e, false));

$("#h_moments_e").html($("#h_moments").html());
$("#m_retained_e").html($("#m_retained").html());
$("#m_cover_e").html($("#m_cover").html());

$("#unfavourable_slide_1").html(process(h1.unfav));
$("#unfavourable_slide_2").html(process(h2.unfav));
$("#favourable_slide_1").html(process(h1.fav));
$("#favourable_slide_2").html(process(h2.fav));

text = ((Math.abs(h1.unfav/h1.fav) <= 1) ? ' [Safe]' : ' [Unsafe]');
fails = ((text == ' [Unsafe]') ? fails + 1 : fails);
$("#utilisation_slide_1").html(process(h1.unfav/h1.fav) + text);
text = ((Math.abs(h2.unfav/h2.fav) <= 1) ? ' [Safe]' : ' [Unsafe]');
fails = ((text == ' [Unsafe]') ? fails + 1 : fails);
$("#utilisation_slide_2").html(process(h2.unfav/h2.fav) + text);

$("#unfavourable_over_1").html(process(m1.unfav));
$("#unfavourable_over_2").html(process(m2.unfav));
$("#favourable_over_1").html(process(m1.fav));
$("#favourable_over_2").html(process(m2.fav));

text = ((Math.abs(m1.unfav/m1.fav) <= 1) ? ' [Safe]' : ' [Unsafe]');
fails = ((text == ' [Unsafe]') ? fails + 1 : fails);
$("#utilisation_over_1").html(process(m1.unfav/m1.fav) + text);
text = ((Math.abs(m2.unfav/m2.fav) <= 1) ? ' [Safe]' : ' [Unsafe]');
fails = ((text == ' [Unsafe]') ? fails + 1 : fails);
$("#utilisation_over_2").html(process(m2.unfav/m2.fav) + text);

$("#total_vertical_1").html(process(v1));
$("#total_vertical_2").html(process(v2));
$("#total_moment_1").html(process(m1_e));
$("#total_moment_2").html(process(m2_e));
$("#base_width_1").html(process(i.total_width) + " [" + process(i.total_width/6) + "]");
$("#base_width_2").html(process(i.total_width) + " [" + process(i.total_width/6) + "]");

text = ((Math.abs(m1_e / v1) <= i.total_width/6) ? ' [Safe]' : ' [Unsafe]');
fails = ((text == ' [Unsafe]' && i.mode == 'gravity') ? fails + 1 : fails);
$("#eccentricity_1").html(process(m1_e/v1) + text);
text = ((Math.abs(m2_e / v2) <= i.total_width/6) ? ' [Safe]' : ' [Unsafe]');
fails = ((text == ' [Unsafe]' && i.mode == 'gravity') ? fails + 1 : fails);
$("#eccentricity_2").html(process(m2_e/v2) + text);

text = ((fails == 0) ? 'Safe' : 'Unsafe - ' + fails + ' fails');
$("#headline_result").html(text);

var turn_ids = ['vertical', 'eccentricity', 'terzaghi'];
text = ((i.mode == 'gravity') ? 'block' : 'none');

for (a=0; a < turn_ids.length; a++)
{
	$("#" + turn_ids[a])[0].style.display = text;
}
$("#headline2")[0].style.display = ((i.mode == 'gravity') ? 'table' : 'none');

}