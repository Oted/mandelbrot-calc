use mandel;
use std::net::{TcpStream, TcpListener};
use std::io::{Read, Write};
use std::thread;

#[derive(Copy, Clone, Debug)]
struct ZoomArgs {
  x_min: f64,
  x_max: f64,
  y_min: f64,
  y_max: f64,
  n_max: i64,
  stepps: i32,
}

fn handle_read(mut stream: &TcpStream) -> String {
    let mut buf = [0u8 ;4096];
    match stream.read(&mut buf) {
        Ok(_) => {
            let req_str = String::from_utf8_lossy(&buf);

            match parse_params(req_str.as_ref()) {
                Ok(result) => {
                    let mut res_body = String::from("{\"status\":1, \"result\":");
                    res_body.push_str(result.as_ref());
                    res_body.push_str("}");

                    return res_body;
                },
                Err(e) => {
                    return String::from("{\"status\":0, \"result\":[]}");
                }
            };
        },
        Err(e) => {
            return String::from("{\"status\":0, \"result\":[]}");
        }
    }
}

fn handle_write(mut stream: &TcpStream, res : String) {
    let mut response = String::from("HTTP/1.1 200 OK\r\nContent-Type: application/json; charset=utf-8\r\nAccess-Control-Allow-Origin: http://localhost:3000");
    response.push_str("\r\n\r\n");
    response.push_str(res.as_ref());

    match stream.write_all(response.as_bytes()) {
        Ok(_) => println!("Response sent"),
        Err(e) => println!("Failed sending response: {}", e),
    }

    stream.flush();
}

fn handle_client(stream: TcpStream) {
    let res = handle_read(&stream);
    handle_write(&stream, res);
}

pub fn fire() {
    let listener = TcpListener::bind("127.0.0.1:8080").unwrap();
    println!("Listening for connections on port {}", 8080);

    for stream in listener.incoming() {
        match stream {
            Ok(stream) => {
                thread::spawn(|| {
                    handle_client(stream)
                });
            }
            Err(e) => {
                println!("Unable to connect: {}", e);
            }
        }
    }
}

fn parse_params(body : &str) -> Result<String, String> {
    let v: Vec<&str> = body.split(' ').collect();
    let s: &str = v[1];
    let params: Vec<&str> = s.split(&['?', '&'][..]).collect();
    let route = params[0].to_string();

    //filter out the actual queery args
    let qs_pairs : Vec<(&str, &str)> =
        params.
        into_iter().
        filter(|param| param.contains("=")).
        map(|x| parse_values(x)).
        collect();

    //zoom path called
    if route == "/get_set" {
        return match get_set_handler(qs_pairs) {
            Ok(res) => return Ok(res),
            Err(e) => return Err(String::from("\"Invalid query params\""))
        }
    }

    return Err(String::from("\"Invalid path\""));
}

fn parse_values(query : &str) -> (&str, &str) {
    let params: Vec<&str> = query.split('=').collect();
    return (params[0], params[1]);
}

/**
 *  Custom functions per implemented route,
 *  expected return Result with Ok(parsable Json value as a string)
 */
fn get_set_handler(qs_pairs : Vec<(&str, &str)>) -> Result<String,String> {
    let mut x_min = None;
    let mut x_max = None;
    let mut y_min = None;
    let mut y_max = None;
    let mut n_max = None;
    let mut stepps = None;

    for pair in qs_pairs {
        match pair.0 {
            "x_min" => {x_min = Some(pair.1.to_string().parse::<f64>().unwrap())},
            "x_max" => {x_max = Some(pair.1.to_string().parse::<f64>().unwrap())},
            "y_min" => {y_min = Some(pair.1.to_string().parse::<f64>().unwrap())},
            "y_max" => {y_max = Some(pair.1.to_string().parse::<f64>().unwrap())},
            "n_max" => {n_max = Some(pair.1.to_string().parse::<i64>().unwrap())},
            "stepps" => {stepps = Some(pair.1.to_string().parse::<i32>().unwrap())},
            _ => {println!("no such qs {}={}",pair.0,pair.1)}
        }
    }

    if x_min.is_none() || x_max.is_none() || y_min.is_none() || y_max.is_none() || n_max.is_none() || stepps.is_none() {
        return Err(String::from("\"Missing arguments\""));
    }

    let zoom_args = ZoomArgs{x_min : x_min.unwrap(), x_max : x_max.unwrap(), y_min : y_min.unwrap(), y_max : y_max.unwrap(), n_max : n_max.unwrap(), stepps : stepps.unwrap()};
    let result = mandel::iterate(zoom_args.x_min, zoom_args.x_max, zoom_args.y_min, zoom_args.y_max, zoom_args.n_max, zoom_args.stepps);

    return Ok(result);
}
