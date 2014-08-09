<?php
define('ERROR', false);

if (!ERROR)
{
	header ("Content-type: image/jpg"); 
}

$image = ImageCreate(1200,1200);
$background = ImageColorAllocate($image, 255, 255, 255);
$blue = ImageColorAllocate($image, 0, 0, 255);
$black = ImageColorAllocate($image, 0,0,0);
$get = array_keys($_GET);
$get = $get[0];

$shapes = split(";", $get);
$thickness = 10;

foreach ($shapes as $shape)
{
if (strlen($shape) >= 9 )
{

	$type = substr($shape, 0, 1);

	$origin_x = intval(substr($shape, 1, 4), 36);
	$origin_y = intval(substr($shape, 5, 4), 36);

	$width = (strlen($shape) >= 13) ? intval(substr($shape, 9, 4), 36) : null;
	$height = (strlen($shape) >= 17) ? intval(substr($shape, 13, 4), 36) : null;

	unset($fill);
	if (strlen($shape) >= 23)
	{
		$fill_r = intval(substr($shape, 17, 2), 16);
		$fill_g = intval(substr($shape, 19, 2), 16);
		$fill_b = intval(substr($shape, 21, 2), 16);
		$fill = ImageColorAllocate($image, $fill_r, $fill_g, $fill_b);
	}

	$id = (strlen($shape) > 23) ? substr($shape, 23, strlen($shape) - 23) : null;
	$no_poly = false;

	// - Triangles (a-d) ---------------------------------------------------------
	if ($type == 'a')
	{
		$points = array (
					$origin_x			, $origin_y,
					$origin_x - $width	, $origin_y,
					$origin_x			, $origin_y + $height
					);
	}
	elseif ($type == 'b')
	{
		$points = array (
					$origin_x			, $origin_y,
					$origin_x + $width	, $origin_y,
					$origin_x			, $origin_y + $height
					);
	}
	elseif ($type == 'c')
	{
		$points = array (
					$origin_x			, $origin_y,
					$origin_x + $width	, $origin_y,
					$origin_x			, $origin_y - $height
					);
	}
	elseif ($type == 'd')
	{
		$points = array (
					$origin_x			, $origin_y,
					$origin_x - $width	, $origin_y,
					$origin_x			, $origin_y - $height
					);
	}
	// - Rectangles (r) ---------------------------------------------------------
	elseif ($type == 'r')
	{
		$points = array (
					$origin_x			, $origin_y,
					$origin_x + $width 	, $origin_y,
					$origin_x + $width	, $origin_y + $height,
					$origin_x			, $origin_y + $height
						);
	}

	// - Dashed Line (w) -----------------------------------------------------
	elseif ($type == 'w')
	{
		$no_poly = true;
		imagesetthickness($image, $thickness);
		imageline($image, $origin_x, $origin_y, $origin_x + $width, $origin_y + $height, $blue);
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
	// - Arrows (p) ----------------------------------------------------------
	elseif ($type == 'p')
	{
		imagesetthickness($image, $thickness/2);
		$arrow_x = $width;
		$arrow_y = $height;
		imageline($image, $origin_x, $origin_y, $arrow_x, $arrow_y, $black);

		$size = 20;
		$down = $arrow_y - $origin_y;
		$right = $arrow_x - $origin_x;

		$dir_down = ($down != 0) ? $down / abs($down) : 0;
		$dir_right = ($right != 0) ? $right / abs($right) : 0;

		if ($right == 0)
		{
			$points = array(
						$arrow_x, $arrow_y,
						$arrow_x-$size/2, $arrow_y - $dir_down*$size,
						$arrow_x+$size/2, $arrow_y - $dir_down*$size);
		}
		elseif ($down == 0)
		{
			$points = array(
						$arrow_x, $arrow_y,
						$arrow_x - $dir_right*$size, $arrow_y+$size/2,
						$arrow_x - $dir_right*$size, $arrow_y-$size/2);			
		}
		else
		{	$no_poly = true;
		}

		$fill = $black;
	}

	if (!$no_poly)
	{
		imagesetthickness($image, 1);
		imagefilledpolygon($image, $points, count($points)/2 , $fill);
	}
}
}


if (!ERROR)
{
	imagejpeg($image);
}

?>