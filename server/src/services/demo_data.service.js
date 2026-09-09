const { supabaseAdmin } = require('../config/supabase');

class DemoDataService {
  async getStatus() {
    try {
      const [empR,custR,supR,prodR,leadR,oppR,quotR,soR,prR,rfqR,poR,grnR,moR,assetR,docR,wfR,qipR] = await Promise.all([
        supabaseAdmin.from('employees').select('id',{count:'exact'}).ilike('employee_code','%DEMO-KOLMEKS-%'),
        supabaseAdmin.from('customers').select('id',{count:'exact'}).ilike('customer_code','%DEMO-KOLMEKS-%'),
        supabaseAdmin.from('suppliers').select('id',{count:'exact'}).ilike('supplier_code','%DEMO-KOLMEKS-%'),
        supabaseAdmin.from('products').select('id',{count:'exact'}).ilike('product_code','%DEMO-KOLMEKS-%'),
        supabaseAdmin.from('crm_leads').select('id',{count:'exact'}).ilike('lead_number','%DEMO-KOLMEKS-%'),
        supabaseAdmin.from('crm_opportunities').select('id',{count:'exact'}).ilike('opportunity_number','%DEMO-KOLMEKS-%'),
        supabaseAdmin.from('quotations').select('id',{count:'exact'}).ilike('quotation_number','%DEMO-KOLMEKS-%'),
        supabaseAdmin.from('sales_orders').select('id',{count:'exact'}).ilike('order_number','%DEMO-KOLMEKS-%'),
        supabaseAdmin.from('purchase_requisitions').select('id',{count:'exact'}).ilike('requisition_number','%DEMO-KOLMEKS-%'),
        supabaseAdmin.from('rfqs').select('id',{count:'exact'}).ilike('rfq_number','%DEMO-KOLMEKS-%'),
        supabaseAdmin.from('purchase_orders').select('id',{count:'exact'}).ilike('po_number','%DEMO-KOLMEKS-%'),
        supabaseAdmin.from('goods_receipts').select('id',{count:'exact'}).ilike('grn_number','%DEMO-KOLMEKS-%'),
        supabaseAdmin.from('production_orders').select('id',{count:'exact'}).ilike('production_number','%DEMO-KOLMEKS-%'),
        supabaseAdmin.from('fixed_assets').select('id',{count:'exact'}).ilike('asset_number','%DEMO-KOLMEKS-%'),
        supabaseAdmin.from('documents').select('id',{count:'exact'}).ilike('document_number','%DEMO-KOLMEKS-%'),
        supabaseAdmin.from('workflow_definitions').select('id',{count:'exact'}).ilike('code','%DEMO-KOLMEKS-%'),
        supabaseAdmin.from('inspection_plans').select('id',{count:'exact'}).ilike('plan_number','%DEMO-KOLMEKS-%'),
      ]);
      const counts={employees:empR.count||0,customers:custR.count||0,suppliers:supR.count||0,products:prodR.count||0,leads:leadR.count||0,opportunities:oppR.count||0,quotations:quotR.count||0,salesOrders:soR.count||0,purchaseRequisitions:prR.count||0,rfqs:rfqR.count||0,purchaseOrders:poR.count||0,goodsReceipts:grnR.count||0,productionOrders:moR.count||0,fixedAssets:assetR.count||0,documents:docR.count||0,workflows:wfR.count||0,inspectionPlans:qipR.count||0};
      const total=Object.values(counts).reduce((a,b)=>a+b,0);
      return {success:true,isSeeded:total>0,totalParentRecords:total,counts,lastCheckedAt:new Date().toISOString()};
    } catch(err) { return {success:false,error:err.message}; }
  }

  async createDemoData(user) {
    console.log('[DEMO] Starting Complete Kolmeks ERP Demo Dataset...');
    await this.deleteDemoData(user);
    const sc = {};
    try {
      // 1. DEPARTMENTS
      let {data:depts} = await supabaseAdmin.from('departments').select('id,name');
      if (!depts||depts.length===0) {
        const dn=['Production','CNC Machining','Assembly','Quality Assurance','Maintenance','Procurement','Warehouse','Sales','Finance','HR','Engineering','Admin'];
        const {data:d}=await supabaseAdmin.from('departments').insert(dn.map((n,i)=>({code:'DEMO-DEPT-'+String(i+1).padStart(3,'0'),name:n}))).select('id,name');
        depts=d||[];
      }
      let {data:faCats}=await supabaseAdmin.from('fixed_asset_categories').select('id');
      let {data:coa}=await supabaseAdmin.from('chart_of_accounts').select('id');
      let uid='802bc391-f9e7-48e7-9a78-79b867e226e6';
      try{const{data:r}=await supabaseAdmin.from('purchase_requisitions').select('requested_by').not('requested_by','is',null).limit(1);if(r&&r[0]&&r[0].requested_by)uid=r[0].requested_by;}catch(e){}

      // 2. EMPLOYEES
      const empDefs=[
        {fn:'Mikael',ln:'Virtanen',email:'mikael@demo-kolmeks.fi',desig:'Operations Manager',gender:'Male',city:'Helsinki',dob:'1985-04-12'},
        {fn:'Elena',ln:'Korhonen',email:'elena@demo-kolmeks.fi',desig:'Production Manager',gender:'Female',city:'Espoo',dob:'1988-09-23'},
        {fn:'Juho',ln:'Makela',email:'juho@demo-kolmeks.fi',desig:'CNC Operator',gender:'Male',city:'Vantaa',dob:'1992-01-15'},
        {fn:'Anna',ln:'Nieminen',email:'anna@demo-kolmeks.fi',desig:'Quality Engineer',gender:'Female',city:'Tampere',dob:'1990-11-05'},
        {fn:'Lauri',ln:'Laine',email:'lauri@demo-kolmeks.fi',desig:'Maintenance Tech',gender:'Male',city:'Turku',dob:'1986-06-30'},
        {fn:'Sofia',ln:'Heikkinen',email:'sofia@demo-kolmeks.fi',desig:'Procurement Exec',gender:'Female',city:'Oulu',dob:'1994-03-18'},
        {fn:'Kalle',ln:'Koskinen',email:'kalle@demo-kolmeks.fi',desig:'Warehouse Supervisor',gender:'Male',city:'Lahti',dob:'1989-08-14'},
        {fn:'Emilia',ln:'Jarvinen',email:'emilia@demo-kolmeks.fi',desig:'Sales Executive',gender:'Female',city:'Jyvaskyla',dob:'1993-12-01'},
        {fn:'Antti',ln:'Lehtonen',email:'antti@demo-kolmeks.fi',desig:'Finance Executive',gender:'Male',city:'Espoo',dob:'1987-07-22'},
        {fn:'Sanna',ln:'Saarinen',email:'sanna@demo-kolmeks.fi',desig:'HR Executive',gender:'Female',city:'Helsinki',dob:'1991-05-19'},
        {fn:'Ville',ln:'Salminen',email:'ville@demo-kolmeks.fi',desig:'Production Engineer',gender:'Male',city:'Tampere',dob:'1984-10-10'},
        {fn:'Katariina',ln:'Heinonen',email:'katariina@demo-kolmeks.fi',desig:'QA Inspector',gender:'Female',city:'Turku',dob:'1995-02-28'},
      ];
      const {data:employees}=await supabaseAdmin.from('employees').insert(empDefs.map((e,i)=>({
        employee_code:'DEMO-KOLMEKS-EMP-'+String(i+1).padStart(3,'0'),first_name:e.fn,last_name:e.ln,email:e.email,
        phone:'+358 40 987'+String(i+10).padStart(3,'0'),
        department_id:depts.length>0?depts[i%depts.length].id:null,
        designation:e.desig,employment_type:'FULL_TIME',
        joining_date:'2024-'+String((i%12)+1).padStart(2,'0')+'-15',
        date_of_birth:e.dob,gender:e.gender,address:'Teollisuuskatu '+(i+12),
        city:e.city,state:'Uusimaa',country:'Finland',postal_code:'00'+i+'0',
        emergency_contact_name:'Contact '+(i+1),emergency_contact_phone:'+358 50 111'+i,
        relationship:i%2===0?'Spouse':'Parent',status:'ACTIVE',
      }))).select();
      sc.employees=employees?employees.length:0;
      try{if(employees)await supabaseAdmin.from('employee_skills').insert(employees.flatMap(emp=>[{employee_id:emp.id,skill_name:'CNC Milling',proficiency_level:'EXPERT',experience_years:6.5},{employee_id:emp.id,skill_name:'ISO 9001',proficiency_level:'INTERMEDIATE',experience_years:4.0}]));}catch(e){}
      try{if(employees)await supabaseAdmin.from('employee_compensation').insert(employees.map((emp,i)=>({employee_id:emp.id,basic_salary:4500+i*350,allowances:800+i*50,hourly_rate:(4500+i*350)/160,currency:'EUR',effective_date:'2026-01-01',status:'ACTIVE'})));}catch(e){}

      // 3. HR OPS
      try{await supabaseAdmin.from('shifts').insert([{name:'Morning Shift A',start_time:'06:00',end_time:'14:00',working_hours:8,break_duration:30,is_active:true},{name:'Afternoon Shift B',start_time:'14:00',end_time:'22:00',working_hours:8,break_duration:30,is_active:true},{name:'Night Shift C',start_time:'22:00',end_time:'06:00',working_hours:8,break_duration:30,is_active:true},{name:'General Day',start_time:'09:00',end_time:'18:00',working_hours:9,break_duration:60,is_active:true}]);}catch(e){}
      try{await supabaseAdmin.from('leave_types').insert([{name:'Annual Leave',code:'DEMO-AL',days_allowed:25,carry_forward:true,is_active:true},{name:'Sick Leave',code:'DEMO-SL',days_allowed:15,carry_forward:false,is_active:true},{name:'Maternity Leave',code:'DEMO-ML',days_allowed:90,carry_forward:false,is_active:true},{name:'Paternity Leave',code:'DEMO-PL',days_allowed:10,carry_forward:false,is_active:true}]);}catch(e){}
      try{await supabaseAdmin.from('holidays').insert([{name:'New Year',holiday_date:'2026-01-01',type:'PUBLIC',status:'ACTIVE'},{name:'Epiphany',holiday_date:'2026-01-06',type:'PUBLIC',status:'ACTIVE'},{name:'Labour Day',holiday_date:'2026-05-01',type:'PUBLIC',status:'ACTIVE'},{name:'Midsummer',holiday_date:'2026-06-20',type:'PUBLIC',status:'ACTIVE'},{name:'Independence Day',holiday_date:'2026-12-06',type:'PUBLIC',status:'ACTIVE'},{name:'Christmas',holiday_date:'2026-12-25',type:'PUBLIC',status:'ACTIVE'},{name:'Boxing Day',holiday_date:'2026-12-26',type:'PUBLIC',status:'ACTIVE'}]);}catch(e){}
      try{
        if(employees&&employees.length>0){
          const sts=['PRESENT','PRESENT','PRESENT','PRESENT','LATE','PRESENT','PRESENT','PRESENT','ABSENT','PRESENT'];
          const att=[];
          employees.slice(0,10).forEach((emp,ei)=>{for(let d=0;d<10;d++){const dt=new Date('2026-09-01');dt.setDate(dt.getDate()+d);const ds=dt.toISOString().split('T')[0];const st=sts[(ei+d)%sts.length];att.push({employee_id:emp.id,attendance_date:ds,check_in:st!=='ABSENT'?(ds+'T07:00:00Z'):null,check_out:st!=='ABSENT'?(ds+'T15:00:00Z'):null,status:st,late_minutes:st==='LATE'?20:0,overtime_hours:ei%3===0?2:0,working_hours:st!=='ABSENT'?8:0});}});
          await supabaseAdmin.from('attendance_records').insert(att);sc.attendance=att.length;
        }
      }catch(e){}
      try{if(employees)await supabaseAdmin.from('leave_requests').insert(employees.map((emp,i)=>({employee_id:emp.id,start_date:'2026-10-05',end_date:'2026-10-09',days:5,reason:['Annual vacation','Medical','Emergency','Wedding','Study','Family'][i%6],status:i<4?'APPROVED':i<8?'PENDING':'REJECTED'})));}catch(e){}

      // 4. PAYROLL
      let pperiods=[];
      try{const{data:pp}=await supabaseAdmin.from('payroll_periods').insert([
        {period_code:'DEMO-KOLMEKS-PP-001',name:'April 2026',start_date:'2026-04-01',end_date:'2026-04-30',status:'CLOSED'},
        {period_code:'DEMO-KOLMEKS-PP-002',name:'May 2026',start_date:'2026-05-01',end_date:'2026-05-31',status:'CLOSED'},
        {period_code:'DEMO-KOLMEKS-PP-003',name:'June 2026',start_date:'2026-06-01',end_date:'2026-06-30',status:'CLOSED'},
        {period_code:'DEMO-KOLMEKS-PP-004',name:'July 2026',start_date:'2026-07-01',end_date:'2026-07-31',status:'CLOSED'},
        {period_code:'DEMO-KOLMEKS-PP-005',name:'August 2026',start_date:'2026-08-01',end_date:'2026-08-31',status:'PROCESSING'},
        {period_code:'DEMO-KOLMEKS-PP-006',name:'September 2026',start_date:'2026-09-01',end_date:'2026-09-30',status:'OPEN'},
      ]).select();pperiods=pp||[];sc.payrollPeriods=pperiods.length;}catch(e){}
      try{if(pperiods.length>=4)await supabaseAdmin.from('payroll_runs').insert(pperiods.slice(0,4).map((p,i)=>({period_id:p.id,run_number:'DEMO-KOLMEKS-PRN-'+String(i+1).padStart(3,'0'),employee_count:12,gross_payroll:65400+i*1200,total_deductions:13080+i*240,net_payroll:52320+i*960,currency:'EUR',status:'POSTED'})));sc.payrollRuns=4;}catch(e){}

      // 5. PRODUCTS
      const pdefs=[
        {code:'DEMO-KOLMEKS-PROD-001',name:'Precision Pump Housing A1',mat:'SS 316L',part:'PN-KMX-101',type:'component'},
        {code:'DEMO-KOLMEKS-PROD-002',name:'Stainless Impeller V2',mat:'Duplex 2205',part:'PN-KMX-102',type:'raw_material'},
        {code:'DEMO-KOLMEKS-PROD-003',name:'Drive Shaft 45mm',mat:'Alloy 42CrMo4',part:'PN-KMX-103',type:'component'},
        {code:'DEMO-KOLMEKS-PROD-004',name:'Bearing Housing',mat:'Cast Iron GJS-400',part:'PN-KMX-104',type:'raw_material'},
        {code:'DEMO-KOLMEKS-PROD-005',name:'Motor Bracket B3',mat:'Al 6061-T6',part:'PN-KMX-105',type:'component'},
        {code:'DEMO-KOLMEKS-PROD-006',name:'Shaft Coupling C1',mat:'Carbon Steel C45',part:'PN-KMX-106',type:'raw_material'},
        {code:'DEMO-KOLMEKS-PROD-007',name:'Rotor Assembly',mat:'Silicon Steel',part:'PN-KMX-107',type:'assembly'},
        {code:'DEMO-KOLMEKS-PROD-008',name:'Stator Core 15kW',mat:'Laminated Steel',part:'PN-KMX-108',type:'component'},
        {code:'DEMO-KOLMEKS-PROD-009',name:'Valve Body DN80',mat:'Super Duplex',part:'PN-KMX-109',type:'raw_material'},
        {code:'DEMO-KOLMEKS-PROD-010',name:'Flange PN16',mat:'Forged Steel',part:'PN-KMX-110',type:'component'},
        {code:'DEMO-KOLMEKS-PROD-011',name:'Mounting Base',mat:'Grey Cast Iron',part:'PN-KMX-111',type:'raw_material'},
        {code:'DEMO-KOLMEKS-PROD-012',name:'Pump Casing Sub',mat:'SS 304',part:'PN-KMX-112',type:'assembly'},
      ];
      const {data:products}=await supabaseAdmin.from('products').insert(pdefs.map(p=>({product_code:p.code,name:p.name,description:'ISO-grade: '+p.name,unit:'pcs',product_type:p.type,part_number:p.part,material:p.mat,minimum_stock:25,status:'active'}))).select();
      sc.products=products?products.length:0;

      // 6. CUSTOMERS
      const cnames=['Valmet Technologies','Wartsila Energy','Konecranes Global','Outokumpu Industrial','Metso Outotec','Danfoss Drives','ABB Motors','Sandvik Mining','Ponsse Industrial','Sulzer Pumps','Neles Automation','Kemira Chemicals'];
      const {data:customers}=await supabaseAdmin.from('customers').insert(cnames.map((name,i)=>({customer_code:'DEMO-KOLMEKS-CUST-'+String(i+1).padStart(3,'0'),company_name:name,legal_name:name+' Abp',contact_person:'CPO '+(i+1),email:'proc'+i+'@'+name.toLowerCase().replace(/[^a-z0-9]/g,'')+'.com',phone:'+358 10 400'+String(i+10).padStart(3,'0'),industry:'Industrial Mfg',segment:'KEY_ACCOUNT',address:'Industrial Blvd '+(i+10),city:'Espoo',state:'Uusimaa',postal_code:'02600',country:'Finland',status:'active'}))).select();
      sc.customers=customers?customers.length:0;
      try{if(customers)await supabaseAdmin.from('customer_contacts').insert(customers.map((c,i)=>({customer_id:c.id,first_name:'Contact'+i,last_name:'Manager',email:'contact'+i+'@kolmeks.demo',phone:'+358 40 555'+i,is_primary:true,status:'active'})));}catch(e){}

      // 7. SUPPLIERS
      const snames=['Ovako Bar Steel','SSAB Europe','SKF Bearings FI','Festo Automation','Parker Hannifin','SEW-Eurodrive','Schaeffler Ind','Luvata Pori','Purso Aluminium','Trelleborg Seal','Tooling Systems','Componenta Cast'];
      const {data:suppliers}=await supabaseAdmin.from('suppliers').insert(snames.map((name,i)=>({supplier_code:'DEMO-KOLMEKS-SUP-'+String(i+1).padStart(3,'0'),company_name:name,legal_name:name+' Oy',contact_person:'Rep '+(i+1),email:'orders'+i+'@kolmeks.demo',phone:'+358 20 700'+String(i+10).padStart(3,'0'),address:'Supply Way '+(i+5),city:'Tampere',state:'Pirkanmaa',postal_code:'33100',country:'Finland',payment_terms:'Net 30',lead_time:7,rating:4.9,quality_score:98,delivery_score:96,overall_score:96,status:'active'}))).select();
      sc.suppliers=suppliers?suppliers.length:0;
      try{if(suppliers)await supabaseAdmin.from('supplier_contacts').insert(suppliers.map((s,i)=>({supplier_id:s.id,first_name:'Rep'+i,last_name:'Officer',job_title:'Account Exec',email:'rep'+i+'@kolmeks.demo',phone:'+358 50 666'+i,is_primary:true,status:'active'})));}catch(e){}

      // 8. CRM
      const {data:leads}=await supabaseAdmin.from('crm_leads').insert(cnames.map((name,i)=>({lead_number:'DEMO-KOLMEKS-LEAD-'+String(i+1).padStart(3,'0'),lead_name:'Parts Inquiry - '+name,company_name:name,contact_person:'Lead Mgr '+(i+1),email:'lead'+i+'@kolmeks.demo',phone:'+358 40 100'+i,source:'Website',priority:'HIGH',expected_value:135000+i*15000,qualification_status:'QUALIFIED',status:'QUALIFIED'}))).select();
      sc.leads=leads?leads.length:0;
      const {data:opportunities}=await supabaseAdmin.from('crm_opportunities').insert(cnames.map((name,i)=>({opportunity_number:'DEMO-KOLMEKS-OPP-'+String(i+1).padStart(3,'0'),name:'Supply Contract - '+name,customer_id:customers?customers[i%customers.length].id:null,lead_id:leads?leads[i%leads.length].id:null,probability:80,priority:'HIGH',source:'Direct',stage:'PROPOSAL',expected_close_date:'2026-11-30'}))).select();
      sc.opportunities=opportunities?opportunities.length:0;

      // 9. QUOTATIONS
      const {data:quotations}=await supabaseAdmin.from('quotations').insert(Array.from({length:12}).map((_,i)=>({quotation_number:'DEMO-KOLMEKS-QUOT-'+String(i+1).padStart(3,'0'),customer_id:customers?customers[i%customers.length].id:null,quotation_date:'2026-08-10',valid_until:'2026-10-10',currency:'EUR',payment_terms:'Net 30',delivery_terms:'FOB Espoo',subtotal:18500+i*1500,tax:4440+i*360,total:22940+i*1860,notes:'Commercial offer.',status:'submitted'}))).select();
      sc.quotations=quotations?quotations.length:0;
      try{if(quotations&&products)await supabaseAdmin.from('quotation_items').insert(quotations.map((q,i)=>({quotation_id:q.id,product_id:products[i%products.length].id,description:products[i%products.length].name,quantity:60+i*10,unit:'pcs',unit_price:370,discount:5,tax:88.80,line_total:18500+i*1500})));}catch(e){}

      // 10. SALES ORDERS + ITEMS with NON-ZERO qty fields
      const {data:salesOrders}=await supabaseAdmin.from('sales_orders').insert(Array.from({length:12}).map((_,i)=>({order_number:'DEMO-KOLMEKS-SO-'+String(i+1).padStart(3,'0'),customer_id:customers?customers[i%customers.length].id:null,quotation_id:quotations?quotations[i%quotations.length].id:null,order_date:'2026-08-15',currency:'EUR',subtotal:28500+i*2200,tax_amount:6840+i*528,discount_amount:500,total:34840+i*2728,priority:'high',status:'pending'}))).select();
      sc.salesOrders=salesOrders?salesOrders.length:0;
      try{if(salesOrders&&products)await supabaseAdmin.from('sales_order_items').insert(salesOrders.map((so,i)=>({sales_order_id:so.id,product_id:products[i%products.length].id,description:products[i%products.length].name,quantity:100+i*20,unit:'pcs',unit_price:285,discount:5,tax:68.40,line_total:28500+i*2200,reserved_quantity:80+i*15,delivered_quantity:i<8?(60+i*12):0,backorder_quantity:i>=8?(40+i*8):0})));}catch(e){}

      // 11. WAREHOUSES + INVENTORY + STOCK MOVEMENTS + PICKINGS
      let warehouses=[];
      try{const{data:wh}=await supabaseAdmin.from('warehouses').insert([{code:'DEMO-KOLMEKS-WH-MAIN',name:'Main Plant Warehouse',city:'Espoo',country:'Finland',status:'active'},{code:'DEMO-KOLMEKS-WH-FG',name:'Finished Goods Store',city:'Espoo',country:'Finland',status:'active'},{code:'DEMO-KOLMEKS-WH-RM',name:'Raw Materials Store',city:'Espoo',country:'Finland',status:'active'}]).select();warehouses=wh||[];sc.warehouses=warehouses.length;}catch(e){console.error('[DEMO WH]',e&&e.message);}
      try{if(products&&warehouses.length>0){await supabaseAdmin.from('inventory').insert(products.map((p,i)=>({product_id:p.id,warehouse_id:warehouses[i%warehouses.length].id,on_hand_quantity:250+i*50,available_quantity:220+i*45,reserved_quantity:30+i*5,on_order_quantity:100+i*15,unit_cost:185+i*15,total_value:(250+i*50)*(185+i*15),status:'in_stock',last_updated:new Date().toISOString()})));sc.inventory=products.length;}}catch(e){}
      try{if(products&&warehouses.length>0){await supabaseAdmin.from('stock_movements').insert(products.map((p,i)=>({product_id:p.id,warehouse_id:warehouses[i%warehouses.length].id,movement_type:i%3===0?'IN':i%3===1?'OUT':'TRANSFER',quantity:50+i*10,unit_cost:185+i*15,total_cost:(50+i*10)*(185+i*15),reference_type:'GRN',reference_number:'DEMO-KOLMEKS-REF-'+String(i+1).padStart(3,'0'),notes:'Stock movement',movement_date:'2026-08-20'})));sc.stockMovements=products.length;}}catch(e){}
      try{if(salesOrders&&warehouses.length>0){const pks=salesOrders.slice(0,8).map((so,i)=>({picking_number:'DEMO-KOLMEKS-PK-'+String(i+1).padStart(3,'0'),sales_order_id:so.id,warehouse_id:warehouses[0].id,status:i<4?'COMPLETED':i<6?'IN_PROGRESS':'PENDING',notes:'Picking for '+so.order_number,created_by:uid}));await supabaseAdmin.from('sales_pickings').insert(pks);sc.pickings=pks.length;}}catch(e){}

      // 12. PROCUREMENT
      const {data:prs}=await supabaseAdmin.from('purchase_requisitions').insert(Array.from({length:12}).map((_,i)=>({requisition_number:'DEMO-KOLMEKS-PR-'+String(i+1).padStart(3,'0'),requested_by:uid,department:'Manufacturing',request_date:'2026-08-01',required_date:'2026-09-30',priority:'HIGH',reason:'Procurement Batch '+(i+1),status:'CONVERTED'}))).select();
      sc.purchaseRequisitions=prs?prs.length:0;
      try{if(prs&&products)await supabaseAdmin.from('purchase_requisition_items').insert(prs.map((pr,i)=>({requisition_id:pr.id,product_id:products[i%products.length].id,description:products[i%products.length].name,quantity:150+i*25,unit:'pcs',required_date:'2026-09-30',estimated_unit_cost:180+i*15})));}catch(e){}
      const {data:rfqs}=await supabaseAdmin.from('rfqs').insert(Array.from({length:12}).map((_,i)=>({rfq_number:'DEMO-KOLMEKS-RFQ-'+String(i+1).padStart(3,'0'),component_name:'Steel Casting Batch '+(i+1),quantity:120+i*15,full_name:'Procurement Officer '+(i+1),company:'Kolmeks Mfg',email:'procurement@kolmeks.fi',phone:'+358 10 999000',country:'Finland',requirement_type:'Supply Chain',unit:'Pcs',surface_finish:'Ra 0.8',tolerance_requirements:'0.01mm',description:'Steel castings procurement.',priority:'medium',status:'NEW'}))).select();
      sc.rfqs=rfqs?rfqs.length:0;
      const {data:pos}=await supabaseAdmin.from('purchase_orders').insert(Array.from({length:12}).map((_,i)=>({po_number:'DEMO-KOLMEKS-PO-'+String(i+1).padStart(3,'0'),supplier_id:suppliers?suppliers[i%suppliers.length].id:null,order_date:'2026-08-05',expected_delivery:'2026-09-15',currency:'EUR',subtotal:18500+i*1500,tax_amount:4440+i*360,discount_amount:300,total:22640+i*1860,payment_terms:'Net 45',delivery_terms:'CIF Warehouse',priority:'HIGH',status:'APPROVED'}))).select();
      sc.purchaseOrders=pos?pos.length:0;
      try{if(pos&&products)await supabaseAdmin.from('purchase_order_items').insert(pos.map((po,i)=>({purchase_order_id:po.id,product_id:products[i%products.length].id,description:products[i%products.length].name,quantity:100+i*15,received_quantity:95+i*15,unit:'pcs',unit_price:185+i*15,line_total:18500+i*1500})));}catch(e){}
      const {data:grns}=await supabaseAdmin.from('goods_receipts').insert(Array.from({length:12}).map((_,i)=>({grn_number:'DEMO-KOLMEKS-GRN-'+String(i+1).padStart(3,'0'),purchase_order_id:pos?pos[i%pos.length].id:null,supplier_id:suppliers?suppliers[i%suppliers.length].id:null,receipt_date:'2026-08-20',status:'DRAFT'}))).select();
      sc.goodsReceipts=grns?grns.length:0;
      try{if(grns&&products)await supabaseAdmin.from('goods_receipt_items').insert(grns.map((grn,i)=>({goods_receipt_id:grn.id,product_id:products[i%products.length].id,received_quantity:100+i*15,accepted_quantity:98+i*15,rejected_quantity:2,unit:'pcs'})));}catch(e){}

      // 13. PRODUCTION ORDERS
      const {data:productionOrders}=await supabaseAdmin.from('production_orders').insert(Array.from({length:12}).map((_,i)=>({production_number:'DEMO-KOLMEKS-MO-'+String(i+1).padStart(3,'0'),production_order_number:'DEMO-KOLMEKS-MO-'+String(i+1).padStart(3,'0'),product_id:products?products[i%products.length].id:null,quantity:150+i*25,planned_quantity:150+i*25,completed_quantity:120+i*20,rejected_quantity:3,progress:85,priority:'HIGH',start_date:'2026-08-10',expected_completion:'2026-09-25',planned_start:'2026-08-10',planned_end:'2026-09-25',status:'in_production'}))).select();
      sc.productionOrders=productionOrders?productionOrders.length:0;

      // 14. FIXED ASSETS
      if(faCats&&faCats.length>0&&coa&&coa.length>0){
        const an=['CNC Alpha','Lathe Beta','Mill Gamma','CMM Station','Compressor 75kW','Forklift 3.5T','Welding Station','Assembly Rig','Surface Grinder','Press 200T','AHU-1','Coolant Filter'];
        try{const{data:fa}=await supabaseAdmin.from('fixed_assets').insert(an.map((name,i)=>({asset_number:'DEMO-KOLMEKS-ASSET-'+String(i+1).padStart(3,'0'),asset_name:name,category_id:faCats[0].id,description:'Plant: '+name,acquisition_date:'2024-01-01',capitalization_date:'2024-01-15',acquisition_cost:95000+i*12000,residual_value:8000,useful_life_months:60,depreciation_method:'STRAIGHT_LINE',accumulated_depreciation:12000+i*1500,net_book_value:83000+i*10500,asset_account_id:coa[0].id,accumulated_depreciation_account_id:coa[0].id,status:'ACTIVE'}))).select();sc.fixedAssets=fa?fa.length:0;}catch(e){sc.fixedAssets=0;}
      }

      // 15. MAINTENANCE
      const adefs=[{n:'CNC Machining Center Alpha-1',t:'CNC_MACHINE',m:'Mazak'},{n:'Horizontal Lathe HT-2400',t:'TURNING_MACHINE',m:'DMG Mori'},{n:'Universal Milling Machine UM-3',t:'MILLING_MACHINE',m:'HAAS'},{n:'Vertical Lathe Press HP-200T',t:'TURNING_MACHINE',m:'Trumpf'},{n:'CNC CMM Machining Center',t:'CNC_MACHINE',m:'Zeiss'},{n:'CNC Welding Machine RW-1',t:'CNC_MACHINE',m:'Fanuc'},{n:'Air Compressor AC-75kW',t:'COMPRESSOR',m:'Kaeser'},{n:'Surface Grinding Machine SG-600',t:'MILLING_MACHINE',m:'Studer'},{n:'CNC Forklift EF-3500',t:'CNC_MACHINE',m:'Toyota'},{n:'Pump Assembly Turning Rig',t:'TURNING_MACHINE',m:'Roper'},{n:'Coolant Filtration Compressor',t:'COMPRESSOR',m:'Hydac'},{n:'Conveyor Milling System',t:'MILLING_MACHINE',m:'Bosch'}];
      let mas=[];
      try{const{data:ma}=await supabaseAdmin.from('assets').insert(adefs.map((a,i)=>({asset_code:'DEMO-KOLMEKS-AST-'+String(i+1).padStart(3,'0'),name:a.n,asset_type:a.t,manufacturer:a.m,model:'M'+(2024+(i%3))+'-'+(i+100),serial_number:'SN-KMX-'+String(i+1001).padStart(4,'0'),purchase_date:'2023-06-01',installation_date:'2023-08-15',location:'Bay '+(i+1),status:i<9?'AVAILABLE':i===9?'UNDER_MAINTENANCE':'BREAKDOWN',criticality:i<4?'HIGH':i<8?'MEDIUM':'LOW'}))).select();mas=ma||[];sc.maintAssets=mas.length;}catch(e){sc.maintAssets=0;console.error('[DEMO ASSETS]',e&&e.message);}
      try{if(mas.length>0)await supabaseAdmin.from('maintenance_schedules').insert(mas.map((a,i)=>({schedule_number:'DEMO-KOLMEKS-PM-'+String(i+1).padStart(3,'0'),asset_id:a.id,maintenance_type:i%3===0?'PREVENTIVE':i%3===1?'PREDICTIVE':'CALIBRATION',title:'Monthly PM - '+a.name,description:'Full PM for '+a.name,frequency_type:'MONTHLY',frequency_value:30,last_completed_date:'2026-07-15',next_due_date:'2026-09-15',priority:i<4?'HIGH':'MEDIUM',status:'ACTIVE'})));sc.maintSchedules=mas.length;}catch(e){}
      try{if(mas.length>0)await supabaseAdmin.from('maintenance_work_orders').insert(mas.map((a,i)=>({work_order_number:'DEMO-KOLMEKS-MWO-'+String(i+1).padStart(3,'0'),asset_id:a.id,maintenance_type:i%2===0?'PREVENTIVE':'CORRECTIVE',title:(i%2===0?'PM':'Repair')+' '+a.name,description:'WO for '+a.name,priority:i<4?'HIGH':i<8?'MEDIUM':'LOW',estimated_hours:4+i,actual_hours:i<8?(3+i):null,estimated_cost:850+i*120,actual_cost:i<8?(800+i*110):null,started_at:i<8?'2026-08-01T08:00:00Z':null,completed_at:i<6?'2026-08-01T14:00:00Z':null,status:i<6?'COMPLETED':i<9?'IN_PROGRESS':'OPEN'})));sc.maintWorkOrders=mas.length;}catch(e){}
      try{if(mas.length>0)await supabaseAdmin.from('maintenance_requests').insert(mas.map((a,i)=>({request_number:'DEMO-KOLMEKS-MR-'+String(i+1).padStart(3,'0'),asset_id:a.id,title:['Vibration','Oil Leak','Noise','Temp Warn','Sensor','Calibration','Belt','Coolant','Bearing','Hydraulic','Electrical','Filter'][i]+' - '+a.name,description:'Issue on '+a.name,priority:i<4?'HIGH':i<8?'MEDIUM':'LOW',status:i<4?'COMPLETED':i<8?'REVIEWED':'OPEN',reported_by:uid})));sc.maintRequests=mas.length;}catch(e){}
      try{if(mas.length>0)await supabaseAdmin.from('downtime_logs').insert(mas.slice(0,10).map((a,i)=>({asset_id:a.id,downtime_type:i%2===0?'BREAKDOWN':'PLANNED',reason:['Hydraulic','SchedPM','Electrical','Tooling','Cooling','Belt','Calibration','Bearing','Software','Emergency'][i],start_time:'2026-08-10T07:00:00Z',end_time:i<8?'2026-08-10T11:00:00Z':null,duration_minutes:i<8?(120+i*30):null,impact:i<4?'HIGH':'MEDIUM',status:i<8?'CLOSED':'OPEN',reported_by:uid})));sc.downtimeLogs=10;}catch(e){}

      // 16. DOCUMENTS & WORKFLOWS
      const {data:documents}=await supabaseAdmin.from('documents').insert(Array.from({length:12}).map((_,i)=>({document_number:'DEMO-KOLMEKS-DOC-'+String(i+1).padStart(3,'0'),title:'SOP-'+(i+1)+': Machining QA',description:'Guidelines unit '+(i+1),confidentiality_level:'INTERNAL',effective_date:'2024-01-01',review_date:'2027-01-01',expiry_date:'2029-01-01',status:'APPROVED'}))).select();
      sc.documents=documents?documents.length:0;
      const {data:workflows}=await supabaseAdmin.from('workflow_definitions').insert(Array.from({length:12}).map((_,i)=>({code:'DEMO-KOLMEKS-WF-'+String(i+1).padStart(3,'0'),name:'Approval Workflow '+(i+1),description:'Multi-stage approval',module:'Procurement',entity_type:'purchase_order',active_version_number:1,status:'Active'}))).select();
      sc.workflows=workflows?workflows.length:0;

      // 17. INSPECTION PLANS
      const {data:qips}=await supabaseAdmin.from('inspection_plans').insert(Array.from({length:12}).map((_,i)=>({plan_number:'DEMO-KOLMEKS-QIP-'+String(i+1).padStart(3,'0'),description:'Inspection component '+(i+1),product_id:products?products[i%products.length].id:null,version:1,inspection_type:'INCOMING',effective_from:'2024-01-01',effective_to:'2028-12-31',status:'ACTIVE'}))).select();
      sc.inspectionPlans=qips?qips.length:0;

      // 18. SALES INVOICES
      let sinvs=[];
      try{const{data:si}=await supabaseAdmin.from('sales_invoices').insert(Array.from({length:12}).map((_,i)=>({invoice_number:'DEMO-KOLMEKS-SI-'+String(i+1).padStart(3,'0'),customer_id:customers?customers[i%customers.length].id:null,sales_order_id:salesOrders?salesOrders[i%salesOrders.length].id:null,invoice_date:'2026-08-20',due_date:'2026-09-19',currency:'EUR',payment_terms:'Net 30',subtotal:28500+i*2200,tax_amount:6840+i*528,discount_amount:500,total_amount:34840+i*2728,paid_amount:i<8?(34840+i*2728):0,outstanding_amount:i<8?0:(34840+i*2728),status:i<8?'PAID':i<10?'ISSUED':'DRAFT'}))).select();sinvs=si||[];sc.salesInvoices=sinvs.length;}catch(e){}
      try{if(sinvs.length>0&&products)await supabaseAdmin.from('sales_invoice_lines').insert(sinvs.map((inv,i)=>({invoice_id:inv.id,product_id:products[i%products.length].id,description:products[i%products.length].name,quantity:100+i*20,unit_price:285,tax_percent:24,line_total:28500+i*2200,line_order:1})));}catch(e){}
      try{if(sinvs.length>=8&&customers)await supabaseAdmin.from('customer_payments').insert(sinvs.slice(0,8).map((inv,i)=>({payment_number:'DEMO-KOLMEKS-CP-'+String(i+1).padStart(3,'0'),customer_id:customers[i%customers.length].id,invoice_id:inv.id,payment_date:'2026-09-10',payment_method:i%3===0?'BANK_TRANSFER':i%3===1?'CHEQUE':'ONLINE',amount:34840+i*2728,currency:'EUR',reference_number:'TXN-KMX-'+String(i+2001).padStart(4,'0'),status:'CONFIRMED'})));sc.customerPayments=8;}catch(e){}

      // 19. PURCHASE INVOICES
      let pinvs=[];
      try{const{data:pi}=await supabaseAdmin.from('purchase_invoices').insert(Array.from({length:12}).map((_,i)=>({internal_invoice_number:'DEMO-KOLMEKS-PI-'+String(i+1).padStart(3,'0'),supplier_invoice_number:'SUP-INV-2026-'+String(i+1001).padStart(4,'0'),supplier_id:suppliers?suppliers[i%suppliers.length].id:null,purchase_order_id:pos?pos[i%pos.length].id:null,invoice_date:'2026-08-25',due_date:'2026-10-09',currency:'EUR',subtotal:18500+i*1500,tax_amount:4440+i*360,total_amount:22940+i*1860,paid_amount:i<8?(22940+i*1860):0,outstanding_amount:i<8?0:(22940+i*1860),match_status:i<8?'MATCHED':'UNMATCHED',status:i<8?'POSTED':i<10?'APPROVED':'DRAFT'}))).select();pinvs=pi||[];sc.purchaseInvoices=pinvs.length;}catch(e){console.error('[DEMO PI]',e&&e.message);}
      try{if(pinvs.length>0&&products)await supabaseAdmin.from('purchase_invoice_lines').insert(pinvs.map((inv,i)=>({invoice_id:inv.id,product_id:products[i%products.length].id,description:'Purchased: '+products[i%products.length].name,quantity:100+i*15,unit_price:185+i*15,tax_percent:24,line_total:18500+i*1500,line_order:1})));}catch(e){}
      try{if(pinvs.length>=8&&suppliers)await supabaseAdmin.from('supplier_payments').insert(pinvs.slice(0,8).map((inv,i)=>({payment_number:'DEMO-KOLMEKS-SP-'+String(i+1).padStart(3,'0'),supplier_id:suppliers[i%suppliers.length].id,purchase_invoice_id:inv.id,payment_date:'2026-10-01',payment_method:i%2===0?'BANK_TRANSFER':'CHEQUE',amount:22940+i*1860,currency:'EUR',reference_number:'PAY-KMX-'+String(i+3001).padStart(4,'0'),status:'CONFIRMED'})));sc.supplierPayments=8;}catch(e){}

      const total=Object.values(sc).reduce((a,b)=>a+b,0);
      console.log('[DEMO] Done! Total records:',total,'| Modules:',Object.keys(sc).join(', '));
      return {success:true,message:'Complete demo dataset seeded - '+total+' records',totalParentRecords:total,counts:sc};
    } catch(err) { console.error('[DEMO] Fatal:',err.message); return {success:false,error:err.message}; }
  }

  async deleteDemoData(user) {
    console.log('[DEMO] Deleting existing demo data...');
    const childTables=[
      {t:'employee_skills',f:null},{t:'employee_compensation',f:null},
      {t:'customer_contacts',f:null},{t:'supplier_contacts',f:null},
      {t:'quotation_items',f:null},{t:'sales_order_items',f:null},
      {t:'purchase_requisition_items',f:null},{t:'purchase_order_items',f:null},
      {t:'goods_receipt_items',f:null},{t:'sales_invoice_lines',f:null},
      {t:'purchase_invoice_lines',f:null},
      {t:'customer_payments',f:'payment_number'},{t:'supplier_payments',f:'payment_number'},
      {t:'attendance_records',f:null},{t:'leave_requests',f:null},
      {t:'leave_types',f:'code'},{t:'shifts',f:null},{t:'holidays',f:null},
      {t:'payroll_runs',f:'run_number'},{t:'payroll_periods',f:'period_code'},
      {t:'maintenance_requests',f:'request_number'},
      {t:'maintenance_work_orders',f:'work_order_number'},
      {t:'maintenance_schedules',f:'schedule_number'},{t:'downtime_logs',f:null},
      {t:'stock_movements',f:'reference_number'},{t:'inventory',f:null},
      {t:'sales_pickings',f:'picking_number'},
    ];
    for(const {t,f} of childTables){try{if(f)await supabaseAdmin.from(t).delete().ilike(f,'%DEMO-KOLMEKS-%');else await supabaseAdmin.from(t).delete().neq('id','00000000-0000-0000-0000-000000000000');}catch(e){}}
    const parentTables=[
      {t:'sales_invoices',f:'invoice_number'},{t:'purchase_invoices',f:'internal_invoice_number'},
      {t:'goods_receipts',f:'grn_number'},{t:'purchase_orders',f:'po_number'},
      {t:'sales_orders',f:'order_number'},{t:'quotations',f:'quotation_number'},
      {t:'production_orders',f:'production_number'},{t:'inspection_plans',f:'plan_number'},
      {t:'crm_opportunities',f:'opportunity_number'},{t:'crm_leads',f:'lead_number'},
      {t:'purchase_requisitions',f:'requisition_number'},{t:'rfqs',f:'rfq_number'},
      {t:'fixed_assets',f:'asset_number'},{t:'documents',f:'document_number'},
      {t:'workflow_definitions',f:'code'},{t:'assets',f:'asset_code'},{t:'warehouses',f:'code'},
    ];
    for(const {t,f} of parentTables){try{await supabaseAdmin.from(t).delete().ilike(f,'%DEMO-KOLMEKS-%');}catch(e){}}
    const masterTables=[{t:'products',f:'product_code'},{t:'customers',f:'customer_code'},{t:'suppliers',f:'supplier_code'},{t:'employees',f:'employee_code'}];
    for(const {t,f} of masterTables){try{await supabaseAdmin.from(t).delete().ilike(f,'%DEMO-KOLMEKS-%');}catch(e){}}
    console.log('[DEMO] Deleted.');
    return {success:true,message:'Demo data deleted'};
  }
}

module.exports = new DemoDataService();
