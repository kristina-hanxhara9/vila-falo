#!/bin/bash

# Vila Falo - Final HTML Update Script
# This script shows you exactly what to change in index.html

echo "════════════════════════════════════════════════════════════"
echo "  Vila Falo - Booking Form Update Instructions"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "📝 MANUAL UPDATE REQUIRED:"
echo ""
echo "Open: /Users/kristinahanxhara/vila-falo/vila-falo/public/index.html"
echo ""
echo "Find this section (search for '700 Lek'):"
echo "─────────────────────────────────────────────────────────────"
echo ""
cat << 'EOF'
                        <!-- Food & Beverage Add-ons -->
                        <div class="form-group">
                            <label data-en="Food & Beverage Packages" data-al="Paketat e Ushqimit & Pijes">Paketat e Ushqimit & Pijes</label>
                            <div class="addon-options">
                                <div class="addon-option">
                                    <input type="checkbox" id="breakfast" name="addons" value="breakfast">
                                    <label for="breakfast" class="addon-label">
                                        <div class="addon-icon"><i class="fas fa-coffee"></i></div>
                                        <div class="addon-info">
                                            <div class="addon-title" data-en="Breakfast" data-al="Mengjes">Mengjes</div>
                                            <div class="addon-price">700 Lek <span data-en="per person" data-al="për person">per person</span></div>
                                            <div class="addon-description" style="font-size: 11px; margin-top: 4px; color: #666;" data-en="Includes: petulla te gjyshes, honey, jam, butter, goat cheese, trahana petka, village eggs, coffee, mountain tea" data-al="Përfshin: petulla te gjyshes, mjalte, recel, gjalpe, djath dhie, trahana petka, veze fshati, kafe, caj mali">Përfshin: petulla te gjyshes, mjalte, recel, gjalpe, djath dhie, trahana petka, veze fshati, kafe, caj mali</div>
                                        </div>
                                    </label>
                                </div>

                            </div>
                        </div>
EOF
echo ""
echo "─────────────────────────────────────────────────────────────"
echo ""
echo "Replace with this:"
echo "─────────────────────────────────────────────────────────────"
echo ""
cat << 'EOF'
                        <!-- Breakfast Information -->
                        <div class="form-group">
                            <div class="breakfast-included-notice">
                                <i class="fas fa-check-circle"></i>
                                <div>
                                    <strong data-en="Breakfast Included" data-al="Mëngjes i Përfshirë">Mëngjes i Përfshirë</strong>
                                    <p data-en="Traditional Albanian breakfast is included in all room prices" data-al="Mëngjesi tradicional shqiptar përfshihet në të gjitha çmimet e dhomave">Mëngjesi tradicional shqiptar përfshihet në të gjitha çmimet e dhomave</p>
                                    <small style="color: #666;" data-en="Includes: petulla te gjyshes, honey, jam, butter, goat cheese, trahana, village eggs, coffee, mountain tea" data-al="Përfshin: petulla te gjyshes, mjalte, reçel, gjalpë, djathë dhie, trahana, vezë fshati, kafé, çaj mali">Përfshin: petulla te gjyshes, mjalte, reçel, gjalpë, djathë dhie, trahana, vezë fshati, kafé, çaj mali</small>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Price Summary -->
                        <div class="form-group">
                            <div class="price-summary" id="priceSummary" style="display: none;">
                                <h4 data-en="Booking Summary" data-al="Përmbledhje e Rezervimit">Përmbledhje e Rezervimit</h4>
                                <div class="price-row">
                                    <span data-en="Room Type:" data-al="Lloji i Dhomës:">Lloji i Dhomës:</span>
                                    <span id="summaryRoomType">-</span>
                                </div>
                                <div class="price-row">
                                    <span data-en="Number of Nights:" data-al="Numri i Netëve:">Numri i Netëve:</span>
                                    <span id="summaryNights">-</span>
                                </div>
                                <div class="price-row">
                                    <span data-en="Price per Night:" data-al="Çmimi për Natë:">Çmimi për Natë:</span>
                                    <span id="summaryPricePerNight">-</span>
                                </div>
                                <div class="price-row total">
                                    <span data-en="Total Price:" data-al="Çmimi Total:">Çmimi Total:</span>
                                    <span id="summaryTotalPrice">-</span>
                                </div>
                                <p class="price-note" data-en="50% deposit required to confirm booking" data-al="Kërkohet depozitë 50% për të konfirmuar rezervimin">Kërkohet depozitë 50% për të konfirmuar rezervimin</p>
                            </div>
                        </div>
EOF
echo ""
echo "─────────────────────────────────────────────────────────────"
echo ""
echo "✅ After making this change:"
echo "   1. Save the file"
echo "   2. Test locally: npm start"
echo "   3. Deploy: git add . && git commit -m 'Updated booking form' && git push heroku main"
echo ""
echo "════════════════════════════════════════════════════════════"
