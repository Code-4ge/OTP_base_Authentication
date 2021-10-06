import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  type:string = 'Non-L3+';
  nonl3checkbox:boolean = true;
  l3checkbox:boolean = false;
  ticket:string = '';
  mobile:string = '';
  active_btn:boolean = true;
  show_code_div:boolean = false;
  btn_bgcolor:any = '';
  btn_color:any = '';
  code_condition:boolean = false;
	error:boolean = false;
	error_msg:any = '';
  time_left: string = '';
  timer:any = '';
  percent:number = 100;

  constructor(private httpclient: HttpClient) { }

  async time(timeleft:number, timetotal:number, progress_precent:number)
  {
    this.percent = 100-((progress_precent/300)*100);
    this.time_left = (Math.floor(timeleft/60) + ":"+ timeleft%60);
    if(timeleft > 0) {
      this.timer = setTimeout(() => {
            this.time((timeleft - 1), timetotal, progress_precent+1);
        }, 1000);
    }
    else{
      this.code_condition = false;
      this.error =true;
      this.error_msg = "TimeOut, Validation failed.";
    }
  };

  ticketkeyup(value:any)
  {
    if(value.length != 0)
    {
      if(!(isNaN(value)))
      {
        console.log('ticket : ',value);
        this.httpclient.post<any>("http://127.0.0.1:3000/api/ticket", {type: this.type, ticket: value}).subscribe((data:any) => {
          console.log(data.msg);
          if(data.msg == 'right data')
          {
            const mark1 = <HTMLElement>document.querySelector("#correct1");
            mark1.style.display = "block";
            const mark2 = <HTMLElement>document.querySelector("#wrong1");
            mark2.style.display = "none";
          }
          else{
            const mark1 = <HTMLElement>document.querySelector("#correct1");
            mark1.style.display = "none";
            const mark2 = <HTMLElement>document.querySelector("#wrong1");
            mark2.style.display = "block";
          }
        });
      }
      else{
        const mark1 = <HTMLElement>document.querySelector("#correct1");
        mark1.style.display = "none";
        const mark2 = <HTMLElement>document.querySelector("#wrong1");
        mark2.style.display = "block";
      }
    }
    else{
      const mark1 = <HTMLElement>document.querySelector("#correct1");
      mark1.style.display = "none";
      const mark2 = <HTMLElement>document.querySelector("#wrong1");
      mark2.style.display = "none";
    }
  }

  phonekeyup(value:any)
  {
    if(value.length != 0)
    {
      if(!(isNaN(value)) && value.length <= 10)
      {
        console.log('mobile : ',value);
        this.httpclient.post<any>("http://127.0.0.1:3000/api/mobile", {type: this.type, mobile: value}).subscribe((data:any) => {
          console.log(data.msg);
          if(data.msg == 'right data')
          {
            const mark1 = <HTMLElement>document.querySelector("#correct2");
            mark1.style.display = "block";
            const mark2 = <HTMLElement>document.querySelector("#wrong2");
            mark2.style.display = "none";

            if(value.length == 10)
            {
              this.active_btn = false;
              this.btn_bgcolor = '#fe0aa7';
              this.btn_color = 'white';
            }
            else{
              this.active_btn = true;
              this.btn_bgcolor = '#bbb9ba';
              this.btn_color = '#fff';
            }

          }
          else{
            const mark1 = <HTMLElement>document.querySelector("#correct2");
            mark1.style.display = "none";
            const mark2 = <HTMLElement>document.querySelector("#wrong2");
            mark2.style.display = "block";
          }
        });
      }
      else{
        const mark1 = <HTMLElement>document.querySelector("#correct2");
        mark1.style.display = "none";
        const mark2 = <HTMLElement>document.querySelector("#wrong2");
        mark2.style.display = "block";
      }
    }
    else{
      const mark1 = <HTMLElement>document.querySelector("#correct2");
      mark1.style.display = "none";
      const mark2 = <HTMLElement>document.querySelector("#wrong2");
      mark2.style.display = "none";
    }
  }

  send_otp(tvalue:any, mvalue:any)
  {
		if(tvalue.length != 0 && !(isNaN(tvalue)) && !(isNaN(mvalue)) && mvalue.length == 10)
		{
			this.httpclient.post<any>("http://127.0.0.1:3000/api/sendcode", {type: this.type, ticket:tvalue, mobile:mvalue}).subscribe((data:any) => {
          console.log(data.msg);
					if(data.msg == 'send done')
					{
						this.ticket = tvalue;
						this.mobile = mvalue;
						this.code_condition = true;
						this.error = false;
            clearTimeout(this.timer);
            this.percent = 100;
            this.time(300, 300, 0);
					}
					else{
						this.error =true;
						this.error_msg = "Ticket No. and Phone No. combination doesn't match";
					}
			});
		}
  }

	checkOTP(value:any)
	{
		if(!(isNaN(value)))
		{
			this.httpclient.post<any>("http://127.0.0.1:3000/api/checkcode", {type:this.type, ticket:this.ticket, mobile:this.mobile, code:value}).subscribe((data:any) => {
          console.log(data.msg);
					if(data.msg == 'correct otp')
					{
						window.open('https://agni.bajajauto.co.in:8882', '_self');
					}
					else{
						this.error = true;
						this.error_msg = "Entered OTP is Wrong, Please enter again or click on 'Send OTP' to Re-send OTP";
					}
			});
		}
    else
    {
      this.error = true;
      this.error_msg = "Entered OTP is Wrong, Please enter again or click on 'Send OTP' to Re-send OTP";
    }
	}
	
  onchecknonl3(value:boolean)
  {
    this.nonl3checkbox = true;
    this.l3checkbox = false;
    this.type = 'Non-L3+';
  }
  oncheckl3(value:boolean)
  {
    this.nonl3checkbox = false;
    this.l3checkbox = true;
    this.type = 'L3+';
  }

  ngOnInit(): void {
  }

}
