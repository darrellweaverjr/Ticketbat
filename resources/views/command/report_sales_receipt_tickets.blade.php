<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title></title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="IE=Edge" />
<meta name="viewport" content="width=610, initial-scale=1">
<style>
.rotate {
/* Safari */
-webkit-transform: rotate(-90deg);
/* Firefox */
-moz-transform: rotate(-90deg);
/* IE */
-ms-transform: rotate(-90deg);
/* Opera */
-o-transform: rotate(-90deg);
/* Internet Explorer */
filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=3);
}
</style>
<body>
  @if ($type && $type=='S')
        @foreach($tickets as $ticket)
        <div style='page-break-after:always;text-align:center;'>
                <div style='float:center;position:absolute;top:-23;left:38;'>
                      <div style='font-size:12px;'>${{$ticket['price_each']}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{$ticket['id']}}-{{$ticket['number']}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{$ticket['ticket_type']}}</div>   
                </div>
                <div style='text-align:center;width:90%;position:absolute;top:0;left:-20;'>
                        <div style='padding-top:2px;'><span style='font-size:22px'>{{$ticket['show_name']}}</span></div>
                        <div style='padding-top:2px;'><span style='font-size:12px'>@if($ticket['package'] != 'None') ({{$ticket['package']}}) @endif at<br/></span>{{$ticket['venue_name']}}</div>
                        <div style='padding-top:3px;'><span style='font-size:12px'>on&nbsp;</span> {{date('l, m/d/Y',strtotime($ticket['show_time']))}} <span style='font-size:12px'>@if($ticket['time_alternative']) - @else at @endif</span>@if($ticket['time_alternative']) - @else {{date('h:i a',strtotime($ticket['show_time']))}} @endif</div>                     
                </div>
                <div class="rotate" style='font-size:12px;position:absolute;top:85;left:317;'>
                        <div style='padding-top:3px;font-size:12px;'>${{$ticket['price_each']}}</div>
                </div>
                <div class="rotate" style='font-size:12px;position:absolute;top:10;left:302;'>
                        <img src='{{$ticket['QRcode']}}' alt='TB{{$ticket['id']}}{{$ticket['user_id']}}{{$ticket['number']}}' width=70px height=70px/>
                </div>
                <div class="rotate" style='font-size:12px;position:absolute;top:-5;left:327;'>
                        <div style='padding-top:3px;font-size:12px;text-align:center;width:40px'>{{$ticket['id']}}-{{$ticket['number']}}</div>
                </div>
                <div style='width:80%;position:absolute;top:85;left:-20;font-size:12px;'>
                        <hr><div style='text-align:center;'><span>@if (!($ticket['restrictions']=='None' || $ticket['restrictions']=='Inherit'))RESTRICTIONS: {{$ticket['restrictions']}} years old to attend the event.@endif</span></div>
                </div>
        </div>
        @endforeach
  @elseif ($type && $type=='C')
        @php $pages=array_chunk($tickets,5) @endphp
        @foreach($pages as $page)
        <div  style='page-break-after:always;text-align:center;'>
        @php $top=0 @endphp
              @foreach($page as $ticket)
              <div style="height:189px">
              @if($top!=0)
                    <div style='width:100%;font-size:12px;'>
                           <hr style="border: 0 none;border-top:2px dashed #322f32">
                    </div>
              @endif
                    <div style='float:left;width:80%;'>
                            <div style='padding-top:2px;'><span style='font-size:12px'></span>{{$ticket['show_name']}} ({{$ticket['ticket_type']}})</div>
                            <div style='padding-top:2px;'><span style='font-size:12px'>@if($ticket['package'] != 'None') ({{$ticket['package']}}) @endif  at<br/></span>{{$ticket['venue_name']}}</div>
                            <div style='padding-top:3px;'><span style='font-size:12px'>on </span> {{date('l, m/d/Y',strtotime($ticket['show_time']))}} </div>
                            <div style='padding-top:3px;'><span style='font-size:12px'>@if($ticket['time_alternative']) - @else at @endif</span>@if($ticket['time_alternative']) - @else {{date('h:i a',strtotime($ticket['show_time']))}} @endif</div>
                            <div style='padding-top:-5px;'><hr><span>{{$ticket['customer_name']}}</span></div><hr>
                            <div style='text-align:center;'><span>@if (!($ticket['restrictions']=='None' || $ticket['restrictions']=='Inherit'))RESTRICTIONS: {{$ticket['restrictions']}} years old to attend the event.@endif</span></div>
                    </div>
                    <div style='float:right;width:20%;'>
                            <div style='padding-top:0px;'><img src='{{$ticket['QRcode']}}' alt='TB{{$ticket['id']}}{{$ticket['user_id']}}{{$ticket['number']}}' width=125px height=125px /></div>
                            <div style='padding-top:2px;text-align:left;padding-left:30px'><span style='font-size:12px;'>Paid: </span>$ {{$ticket['price_each']}} </div>
                            <div style='padding-top:2px;text-align:left;padding-left:30px'><span style='font-size:12px;'>Ticket: </span> {{$ticket['id']}}-{{$ticket['number']}} </div>
                    </div>
              @php $top=$top+1 @endphp
                </div> 
              @endforeach
      </div>
      @endforeach
  @else
  @php echo $tickets @endphp
  @endif