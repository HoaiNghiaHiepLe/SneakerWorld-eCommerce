import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Row,
  Col,
  Button,
  Card,
  Form,
  Select,
  Input,
  Table,
  Image,
  Space,
} from "antd";

import {
  getCityListAction,
  getDistrictListAction,
  getWardListAction,
  setCheckoutInfoAction,
} from "../../../../../redux/actions";

import * as S from "./styles";

const Info = ({ setStep }) => {
  const [infoForm] = Form.useForm();
  const dispatch = useDispatch();

  const { cityList, districtList, wardList } = useSelector(
    (state) => state.location
  );
  const { userInfo } = useSelector((state) => state.user);
  const { checkoutCoupon, cartList } = useSelector((state) => state.cart);

  const calcDiscount = (currentPrice, discount) => {
    return currentPrice - (currentPrice * discount) / 100;
  };

  const calcPrice = (price, quantity) => price * quantity;

  const calcTotalPrice = () => {
    if (cartList.length > 0) {
      return cartList
        .map((item) => calcDiscount(item.price, item.discount) * item.quantity)
        .reduce((total, price) => total + price);
    } else {
      return 0;
    }
  };

  const initialValues = {
    fullName: userInfo.data?.fullName || "",
    email: userInfo.data.email || "",
    phone: "",
    address: "",
    cityCode: undefined,
    DistrictCode: undefined,
    WardCode: undefined,
  };

  useEffect(() => {
    dispatch(getCityListAction());
  }, []);

  useEffect(() => {
    if (userInfo.data.id) {
      infoForm.resetFields();
    }
  }, [userInfo.data]);

  const handleSubmitInfoForm = (values) => {
    const { cityCode, districtCode, wardCode, ...otherValues } = values;
    const cityData = cityList.data.find((item) => item.code === cityCode);
    const districtData = districtList.data.find(
      (item) => item.code === districtCode
    );
    const wardData = wardList.data.find((item) => item.code === wardCode);
    dispatch(
      setCheckoutInfoAction({
        ...otherValues,
        cityId: cityData.id,
        cityName: cityData.name,
        districtId: districtData.id,
        districtName: districtData.name,
        wardId: wardData.id,
        wardName: wardData.name,
      })
    );
    setStep(2);
  };

  const renderCityOptions = useMemo(() => {
    return cityList.data.map((item) => {
      return (
        <Select.Option key={item.id} value={item.code}>
          {item.name}
        </Select.Option>
      );
    });
  }, [cityList.data]);

  const renderDistrictOptions = useMemo(() => {
    return districtList.data.map((item) => {
      return (
        <Select.Option key={item.id} value={item.code}>
          {item.name}
        </Select.Option>
      );
    });
  }, [districtList.data]);

  const renderWardListOptions = useMemo(() => {
    return wardList.data.map((item) => {
      return (
        <Select.Option key={item.id} value={item.code}>
          {item.name}
        </Select.Option>
      );
    });
  }, [wardList.data]);

  const tableColumns = [
    {
      title: "T??n s???n ph???m",
      dataIndex: "productName",
      key: "productName",
      render: (_, record) => {
        return (
          <Space key={record.optionId}>
            <Image
              src={record?.image}
              alt={record?.productName}
              style={{
                width: "80px",
                height: "auto",
                borderRadius: "10px",
              }}
            />
            <h4>{record?.productName}</h4>
          </Space>
        );
      },
    },
    {
      title: "Ha??ng",
      dataIndex: "productBrand",
      key: "productBrand",
      align: "center",
      render: (_, record) => record.productBrand,
      responsive: ["md"],
    },
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
    },
    {
      title: "????n gi??",
      dataIndex: "price",
      key: "price",
      render: (_, record) => (
        <div className="item_price">
          <s className="prime_price">{record.price.toLocaleString()} ??</s>
          <span className="item_discount">
            Ti???t ki???m <b> {record.discount}%</b>
          </span>
          <span className="final_price_each">
            {calcDiscount(record.price, record.discount).toLocaleString()}??
          </span>
        </div>
      ),
    },
    {
      title: "S??? l?????ng",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Th??nh ti???n",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (_, record) => (
        <span className="final_price">{`${calcPrice(
          calcDiscount(record.price, record.discount),
          record.quantity
        ).toLocaleString()}??`}</span>
      ),
    },
  ];

  const tableData = cartList.map((item) => ({
    ...item,
    key: `${item.productId}${item.optionId && `-${item.optionId}`}`,
  }));

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col span={2}></Col>
        <Col span={20}>
          <S.CartListTable
            style={{ marginTop: "28px" }}
            bordered
            pagination={false}
            columns={tableColumns}
            dataSource={tableData}
            footer={() =>
              checkoutCoupon.discountPrice ? (
                <h4 style={{ textAlign: "right" }}>
                  T???ng ti????n: {checkoutCoupon.discountPrice?.toLocaleString()}
                  <sup>??</sup> (??a?? a??p du??ng ma?? gia??m gia?? {checkoutCoupon.discount}
                  %)
                </h4>
              ) : (
                <h4 style={{ textAlign: "right" }}>
                  T???ng ti????n: {calcTotalPrice().toLocaleString()}
                  <sup>??</sup>
                </h4>
              )
            }
          />
        </Col>
        <Col span={2}></Col>
      </Row>
      <br></br>
      <Row gutter={[16, 16]}>
        <Col span={2}></Col>
        <Col span={20}>
          <Card
            size="small"
            style={{
              boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
              margin: "20px 0",
            }}
            title={<h3>Th??ng tin ng?????i nh???n</h3>}
          >
            <Form
              name="infoForm"
              form={infoForm}
              initialValues={initialValues}
              labelCol={{
                span: 7,
              }}
              onFinish={(values) => handleSubmitInfoForm(values)}
            >
              <Form.Item
                label={<b>H??? v?? t??n</b>}
                name="fullName"
                rules={[
                  {
                    required: true,
                    message: "????y l?? tr?????ng b???t bu???c!",
                  },
                ]}
              >
                <Input
                  style={{
                    boxShadow: "rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px",
                  }}
                />
              </Form.Item>
              <Form.Item
                label={<b>Email</b>}
                name="email"
                rules={[
                  {
                    required: true,
                    message: "????y l?? tr?????ng b???t bu???c!",
                  },
                ]}
              >
                <Input
                  style={{
                    boxShadow: "rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px",
                  }}
                />
              </Form.Item>
              <Form.Item
                label={<b>phone</b>}
                name="phone"
                rules={[
                  {
                    required: true,
                    message: "????y l?? tr?????ng b???t bu???c!",
                  },
                ]}
              >
                <Input
                  style={{
                    boxShadow: "rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px",
                  }}
                />
              </Form.Item>
              <Form.Item
                label={<b>T???nh/Th??nh ph???</b>}
                name="cityCode"
                rules={[
                  {
                    required: true,
                    message: "????y l?? tr?????ng b???t bu???c!",
                  },
                ]}
              >
                <Select
                  style={{
                    boxShadow: "rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px",
                  }}
                  onChange={(value) => {
                    dispatch(getDistrictListAction({ cityCode: value }));
                    infoForm.setFieldsValue({
                      districtCode: undefined,
                      wardCode: undefined,
                    });
                  }}
                >
                  {renderCityOptions}
                </Select>
              </Form.Item>
              <Form.Item
                label={<b>Qu???n/Huy???n</b>}
                name="districtCode"
                rules={[
                  {
                    required: true,
                    message: "????y l?? tr?????ng b???t bu???c!",
                  },
                ]}
              >
                <Select
                  style={{
                    boxShadow: "rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px",
                  }}
                  onChange={(value) => {
                    dispatch(getWardListAction({ districtCode: value }));
                    infoForm.setFieldsValue({
                      wardCode: undefined,
                    });
                  }}
                  disabled={!infoForm.getFieldValue("cityCode")}
                >
                  {renderDistrictOptions}
                </Select>
              </Form.Item>
              <Form.Item
                label={<b>Ph?????ng/X??</b>}
                name="wardCode"
                rules={[
                  {
                    required: true,
                    message: "????y l?? tr?????ng b???t bu???c!",
                  },
                ]}
              >
                <Select
                  style={{
                    boxShadow: "rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px",
                  }}
                  disabled={!infoForm.getFieldValue("districtCode")}
                >
                  {renderWardListOptions}
                </Select>
              </Form.Item>
              <Form.Item
                label={<b>?????a ch???</b>}
                name="address"
                rules={[
                  {
                    required: true,
                    message: "????y l?? tr?????ng b???t bu???c!",
                  },
                ]}
              >
                <Input
                  style={{
                    boxShadow: "rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px",
                  }}
                />
              </Form.Item>
              <Row justify="space-between">
                <Button
                  style={{
                    boxShadow:
                      "rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px",
                  }}
                  onClick={() => setStep(0)}
                >
                  Quay l???i
                </Button>
                <Button
                  style={{
                    boxShadow:
                      "rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px",
                  }}
                  type="primary"
                  onClick={() => infoForm.submit()}
                >
                  Thanh to??n
                </Button>
              </Row>
            </Form>
          </Card>
        </Col>

        <Col span={2}></Col>
      </Row>
    </>
  );
};

export default Info;
