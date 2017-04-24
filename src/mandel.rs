// extern crate rustc_serialize;
// use rustc_serialize::json;
//

#[derive(Copy, Clone)]
struct Result {
  x: f64,
  y: f64,
  n: i64
}

#[derive(Copy, Clone)]
struct Point {
  x : f64,
  y : f64,
}

pub fn iterate(x_min : f64, x_max : f64, y_min : f64, y_max : f64, n_max : i64, stepps : i32) -> String {
  let mut x = x_min;

  let mut x_index = 0;
  let mut y_index;

  let x_delt = x_max - x_min;
  let y_delt = y_max - y_min;

  let x_stepps = x_delt / stepps as f64;
  let y_stepps = y_delt / stepps as f64;

  let mut result = vec![vec![Result {x : 0.0, y : 0.0, n : 0}; stepps as usize]; stepps as usize];

  while x_index < stepps && x <= x_max {
    let mut y = y_min;
    y_index = 0;

    while y_index < stepps && y <= y_max {
      let mut n = 0;
      let mut z = Point {x : 0.0, y : 0.0};

      while z.x * z.x + z.y * z.y <= 4.0 && n <= n_max {
         z = calc_new_z(z, x, y);
         n = n + 1;
      }

      y += y_stepps;
      result[x_index as usize][y_index as usize] = Result {x : x, y : y, n : n};
      y_index = y_index + 1;
    }

    x += x_stepps;
    x_index = x_index + 1;
  }

  return convert_result(result);
}

/**
  Build the string returned to the api module and the user
 */
fn convert_result(res : Vec<Vec<Result>>) -> String {
    let mut s = String::from("[");

    for v in res {
        for res in v {
            s.push_str(&res.x.to_string());
            s.push_str(",");
            s.push_str(&res.y.to_string());
            s.push_str(",");
            s.push_str(&res.n.to_string());
            s.push_str(",");
        }
    };

    s.pop();
    s.push_str("]");
    return s;
}

fn calc_new_z(z : Point, c_x : f64, c_y : f64) -> Point {
  let z_x_pow = z.x * z.x;
  let z_y_pow = z.y * z.y;

  let mut zy = z.x * z.y;
  zy = zy + zy;
  zy = zy + c_y;
  let zx = z_x_pow - z_y_pow + c_x;

  return Point {x : zx, y : zy};
}
