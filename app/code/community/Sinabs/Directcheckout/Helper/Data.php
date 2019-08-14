<?php
/**
 * Magento
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://opensource.org/licenses/osl-3.0.php
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@magentocommerce.com so we can send you a copy immediately.
 *
 * @category    Sinabs
 * @package     Sinabs_Directcheckout
 * @copyright   Copyright (c) 2014 Sinabs (http://www.sinabs.fr)
 * @license     http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */
class Sinabs_Directcheckout_Helper_Data extends Mage_Core_Helper_Abstract
{
	/**
	 * XML path allowed to order in guest
	 *
	 */
	const XML_PATH_CHECKOUT_OPTIONS_GUEST_CHECKOUT = 'checkout/options/guest_checkout';
	
	const XML_PATH_DIRECTCHECKOUT_GENERAL_ENABLED = 'directcheckout/general/enabled';
	
	/**
	 * Is Enabled
	 *
	 * @return boolean
	 */
	public function isEnabled()
	{
		return Mage::getStoreConfig(self::XML_PATH_DIRECTCHECKOUT_GENERAL_ENABLED) && Mage::helper('core')->isModuleOutputEnabled('Sinabs_Directcheckout');
	}
	
	/**
	 * Set Shipping default address
	 *
	 * @param array $data
	 * @return Mage_Core_Checkout_Model_Quote
	 */
	public function setDefaultShipping($data)
	{
		$region = (!isset($data['region']) || empty($data['region'])) ? "-" : $data['region'];
		$region_id = (!isset($data['region_id']) || empty($data['region_id'])) ? "-" : $data['region_id'];
		$city = (!isset($data['city']) || empty($data['city'])) ? "-" : $data['city'];
		
		$quote = Mage::getSingleton('checkout/type_onepage')->getQuote();
	    
	    $quote->getShippingAddress()
			->setCountryId($data['country_id'])
			->setRegionId($region_id)
			->setRegion($region)
			->setCity($city)
			->setCollectShippingRates(true);
			
		$quote->getShippingAddress()->collectShippingRates();
	    $quote->setTotalsCollectedFlag(false);
		$quote->save();
		
		return $quote;
	}
	
	/**
	 * Is newsletter module enabled
	 *
	 * @return boolean
	 */
	public function isNewsletterEnabled()
    {
    	return Mage::helper('core')->isModuleOutputEnabled('Mage_Newsletter');
    }
    
    /**
     * Is guest order enabled
     *
     * @return boolean
     */
    public function isGuestEnabled()
    {
    	return Mage::getStoreConfig(self::XML_PATH_CHECKOUT_OPTIONS_GUEST_CHECKOUT);
    }
}