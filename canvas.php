<?php

header ("Content-type: image/png"); 
$image = ImageCreate(1200,1200);
$background = ImageColorAllocate($image, 0,0,0);

$get = array_keys($_GET);
$get = $get[0];

$shapes = split(";", $get);

foreach ($shapes as $shape)
{
	if (strlen($shape) >= 17 )
	{

		$type = substr($shape, 0, 1);

		$origin_x = intval(substr($shape, 1, 4), 36);
		$origin_y = intval(substr($shape, 5, 4), 36);

		$width = intval(substr($shape, 9, 4), 36);
		$height = intval(substr($shape, 13, 4), 36);

		if (strlen($shape) >= 23)
		{
			$fill_r = intval(substr($shape, 17, 2), 16);
			$fill_g = intval(substr($shape, 19, 2), 16);
			$fill_b = intval(substr($shape, 21, 2), 16);
			$fill = ImageColorAllocate($image, $fill_r, $fill_g, $fill_b);
		}

		$id = (strlen($shape) > 23) ? substr($shape, 23, strlen($shape) - 23) : null;
		$no_poly = false;

		// - Triangles ---------------------------------------------------------
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
		// - Rectangles ---------------------------------------------------------
		elseif ($type == 'e')
		{
			$points = array (
						$origin_x			, $origin_y,
						$origin_x - $width 	, $origin_y,
						$origin_x - $width	, $origin_y + $height,
						$origin_x			, $origin_y + $height
							);
		}
		elseif ($type == 'f')
		{
			$points = array (
						$origin_x			, $origin_y,
						$origin_x + $width 	, $origin_y,
						$origin_x + $width	, $origin_y + $height,
						$origin_x			, $origin_y + $height
							);
		}
		elseif ($type == 'g')
		{
			$points = array (
						$origin_x			, $origin_y,
						$origin_x + $width 	, $origin_y,
						$origin_x + $width	, $origin_y - $height,
						$origin_x			, $origin_y - $height
							);
		}
		elseif ($type == 'h')
		{
			$points = array (
						$origin_x			, $origin_y,
						$origin_x - $width 	, $origin_y,
						$origin_x - $width	, $origin_y - $height,
						$origin_x			, $origin_y - $height
							);
		}
		// - Dashed Line -----------------------------------------------------
		elseif ($type == 'w')
		{
			$no_poly = true;
			$blue = imagecolorallocate($im, 0, 0, 255);
			$style = array_merge(array_fill(0, 10, $blue), array_fill(0, 10, $background));
			imagesetstyle($im, $style);
			imageline($im, $origin_x, $origin_y, $origin_x + $width, $origin_y + $height, IMG_COLOR_STYLED);
		}

		if (!$no_poly)
		{
			imagefilledpolygon($image, $points, count($points)/2 , $fill);
		}
	}
}

ImagePng($image);

?>