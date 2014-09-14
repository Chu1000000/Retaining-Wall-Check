<?php
define('ERROR', false);

if (!ERROR)
{
	header ("Content-type: image/png"); 
}

$image = ImageCreate(1200,1200);
$background = ImageColorAllocate($image, 255, 255, 255);
$black = ImageColorAllocate($image, 0,0,0);
$purple = ImageColorAllocate($image, 200, 0, 200);
ImageColorTransparent($image, $background);

$char_height = 30;
$char_width = 11 / 20 * $char_height;

$get = array_keys($_GET);
if (isset($get[0]))
{
$get = $get[0];

$shapes = split(";", $get);
$thickness = 10;


foreach ($shapes as $shape)
{
if (strlen($shape) >= 9 )
{

	$text = false;
	$points = array();
	$type = substr($shape, 0, 1);

	if ($type == 'g')
	{
		$colour = ImageColorAllocate($image, intval(substr($shape, 1, 2), 16), intval(substr($shape, 3, 2), 16), intval(substr($shape, 5, 2), 16));
		$count = floor((strlen($shape) - 7) / 4);
		for ($i = 0; $i < $count; $i++)
		{
			$points[0][] = intval(substr($shape, $i * 4 + 7, 4), 36);
		}	

		imagesetthickness($image, $thickness * 0.8);
		imagepolygon($image, $points[0], count($points[0])/2, $colour);
		$no_poly = true;
	}
	else
	{
		$origin_x = intval(substr($shape, 1, 4), 36);
		$origin_y = intval(substr($shape, 5, 4), 36);

		if ($type == 't')
		{
			$align = intval(substr($shape, 9, 1));

			unset($fill);
			
			$fill_r = intval(substr($shape, 10, 2), 16);
			$fill_g = intval(substr($shape, 12, 2), 16);
			$fill_b = intval(substr($shape, 14, 2), 16);
			$fill = ImageColorAllocate($image, $fill_r, $fill_g, $fill_b);
			$label = substr($shape, 16, strlen($shape) - 15);
			$text = true;
			$no_poly = true;
		}
		else
		{

		$width = (strlen($shape) >= 13) ? intval(substr($shape, 9, 4), 36) : null;
		$height = (strlen($shape) >= 17) ? intval(substr($shape, 13, 4), 36) : null;

		if ($type == 'm')
		{
			$dir = (strlen($shape) >= 18) ? substr($shape, 17, 1) : false;
			$label = (strlen($shape) >= 19) ? substr($shape, 18, strlen($shape) - 17) : false;
		} 
		else 
		{
		
		unset($fill);
		if (strlen($shape) >= 23)
		{
			$fill_r = intval(substr($shape, 17, 2), 16);
			$fill_g = intval(substr($shape, 19, 2), 16);
			$fill_b = intval(substr($shape, 21, 2), 16);
			$fill = ImageColorAllocate($image, $fill_r, $fill_g, $fill_b);
		}

		$id = (strlen($shape) > 23) ? substr($shape, 23, strlen($shape) - 23) : null;
		}
		$no_poly = false;

		}

	}

	// - Triangles (a-d) ---------------------------------------------------------
	if ($type == 'a')
	{
		$points[] = array (
					$origin_x			, $origin_y,
					$origin_x - $width	, $origin_y,
					$origin_x			, $origin_y + $height
					);
	}
	elseif ($type == 'b')
	{
		$points[] = array (
					$origin_x			, $origin_y,
					$origin_x + $width	, $origin_y,
					$origin_x			, $origin_y + $height
					);
	}
	elseif ($type == 'c')
	{
		$points[] = array (
					$origin_x			, $origin_y,
					$origin_x + $width	, $origin_y,
					$origin_x			, $origin_y - $height
					);
	}
	elseif ($type == 'd')
	{
		$points[] = array (
					$origin_x			, $origin_y,
					$origin_x - $width	, $origin_y,
					$origin_x			, $origin_y - $height
					);
	}
	// - Rectangles (r) ---------------------------------------------------------
	elseif ($type == 'r')
	{
		$points[] = array (
					$origin_x			, $origin_y,
					$origin_x + $width 	, $origin_y,
					$origin_x + $width	, $origin_y + $height,
					$origin_x			, $origin_y + $height
						);
	}

	// - Line (l) -----------------------------------------------------
	elseif ($type == 'l')
	{
		$no_poly = true;
		imagesetthickness($image, $thickness);
		imageline($image, $origin_x, $origin_y, $origin_x + $width, $origin_y + $height, $fill);
	}

	// - Surcharge (s) -------------------------------------------------------
	elseif ($type == 's')
	{
		$width = 1200 - $origin_x;
		$size = 40;

		$number = floor($width / $size);
		$size = $width / $number;

		imagesetthickness($image, 1);
		for ($i = 0; $i < $number; $i++)
		{
			imagearc($image, $origin_x + $size * (0.5 + $i), $origin_y, $size, $size, 180, 0, $black);
		}
		$no_poly = true;
	}
	// - Arrows (p) & Measure dims (m) ----------------------------------------------------------
	elseif ($type == 'p' || $type == 'm')
	{
		$fill = ($type == 'p') ? $purple : $black;
		imagesetthickness($image, $thickness/2);
		$arrow_x = $width;
		$arrow_y = $height;
		imageline($image, $origin_x, $origin_y, $arrow_x, $arrow_y, $fill);

		$size = 20;
		$down = $arrow_y - $origin_y;
		$right = $arrow_x - $origin_x;
		$mag = sqrt($down^2 + $right^2);

		$dir_down = ($down != 0) ? $down / abs($down) : 0;
		$dir_right = ($right != 0) ? $right / abs($right) : 0;


		if ($right == 0)
		{
			$points[] = array(
						$arrow_x, $arrow_y,
						$arrow_x-$size/2, $arrow_y - $dir_down*$size,
						$arrow_x+$size/2, $arrow_y - $dir_down*$size);
			if ($type == 'm')
			{
				$points[] = array(
								$origin_x, $origin_y,
								$origin_x-$size/2, $origin_y + $dir_down*$size,
								$origin_x+$size/2, $origin_y + $dir_down*$size); 
			}
		}
		elseif ($down == 0)
		{
			$points[] = array(
						$arrow_x, $arrow_y,
						$arrow_x - $dir_right*$size, $arrow_y+$size/2,
						$arrow_x - $dir_right*$size, $arrow_y-$size/2);	

			if ($type == 'm')
			{
				$points[] = array(
								$origin_x, $origin_y,
								$origin_x + $dir_right*$size, $origin_y+$size/2,
								$origin_x + $dir_right*$size, $origin_y-$size/2);
			}
		}
		else
		{	$no_poly = true;
		}

		if ($type == 'm' && $label !== false)
		{
			$text = true;

			if ($dir == 0)
			{
				$align = 7;
			}
			else if ($dir == 1)
			{
				$align = 3;
			}
			else if ($dir == 2)
			{
				$align = 1;
			}
			else if ($dir == 3)
			{
				$align = 5;
			}

			$origin_x = ($origin_x + $arrow_x) / 2;
			$origin_y = ($origin_y + $arrow_y) / 2;

			$fill = $black;
		}
	}

	if ($text == true)
	{
		$h_align = ($align % 3);
		$v_align = floor($align / 3) - 2;
		//	0	1	2
		//	3	4	5
		//	6	7	8

		imagettftext($image, $char_height, 0, $origin_x - $h_align * $char_width * strlen($label) / 2 - ($h_align - 1) * 2* $char_width, $origin_y - $v_align * $char_height / 2 - ($v_align + 1) * $char_height, $fill, 'arial.ttf', str_replace("_", ".", $label));
	}

	if (!$no_poly)
	{
		imagesetthickness($image, 0);
		foreach ($points as $poly)
		{
			imagefilledpolygon($image, $poly, count($poly)/2 , $fill);
		}
	}
}
}
}

if (!ERROR)
{

	imagepng($image);
}

?>